from flask import Blueprint, request, jsonify
from utility import supabase, get_authenticated_user

posts_bp = Blueprint('posts', __name__)

# 1. Fetch all forum posts (Feed)
@posts_bp.route('/', methods=['GET', 'OPTIONS'], strict_slashes=False)
def get_posts():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        response = supabase.table('posts').select(
            '*, users!posts_user_id_fkey(username), albums(*)'
        ).order('created_at', desc=True).execute()
        return jsonify(response.data), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# 2. Create a new post
@posts_bp.route('/', methods=['POST', 'OPTIONS'], strict_slashes=False)
def create_post():
    if request.method == 'OPTIONS':
        return '', 200

    user = get_authenticated_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    title = data.get('title')
    body = data.get('body')
    album_id = data.get('album_id')  # Optional UUID

    if not title or not body:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        response = supabase.table('posts').insert({
            'user_id': user.id,
            'title': title,
            'body': body,
            'album_id': album_id
        }).execute()
        return jsonify({'message': 'Post created', 'post': response.data[0]}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# 3. Get single post details and its comments
@posts_bp.route('/<post_id>', methods=['GET', 'OPTIONS'], strict_slashes=False)
def get_post_detail(post_id):
    if request.method == 'OPTIONS':
        return '', 200

    try:
        # Fetch the main post and the author's username
        post_res = supabase.table('posts').select(
            '*, users!posts_user_id_fkey(username), albums(*)'
        ).eq('id', post_id).single().execute()

        # Fetch all comments for this post, including the commenter's username
        comments_res = supabase.table('comments').select(
            '*, users(username)'
        ).eq('post_id', post_id).order('created_at', asc=True).execute()

        return jsonify({
            'post': post_res.data,
            'comments': comments_res.data
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# 4. Add a comment or reply to a comment
@posts_bp.route('/<post_id>/comments', methods=['POST', 'OPTIONS'], strict_slashes=False)
def add_comment(post_id):
    if request.method == 'OPTIONS':
        return '', 200

    user = get_authenticated_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    body = data.get('body')
    parent_id = data.get('parent_id')  # NULL for top-level, UUID string if reply

    if not body:
        return jsonify({'error': 'Missing required fields'}), 400

    try:
        # Insert into Supabase comments table matching your schema
        response = supabase.table('comments').insert({
            'post_id': post_id,
            'user_id': user.id,
            'parent_id': parent_id,
            'body': body
        }).execute()

        created_comment = response.data[0] if response.data else {}
        return jsonify({'message': 'Comment added', 'comment': response.data[0]}), 201
    except Exception as e:
        print("ADD COMMENT ERROR:", e)
        return jsonify({'error': str(e)}), 500
    
# 5. Delete a comment (Optional addition for full CRUD)
@posts_bp.route('/comments/<comment_id>', methods=['DELETE', 'OPTIONS'], strict_slashes=False)
def delete_comment(comment_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    user = get_authenticated_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try: 
        # Ensire the user owns the comment before deleting
        existing = supabase.table('comments').select('user_id').eq('id', comment_id).single().execute()
        if not existing.data or existing.data['user_id'] != user.id:
            return jsonify({'error': 'Forbidden: You can only delete your own comments'}), 403
        
        supabase.table('comments').delete().eq('id', comment_id).execute()
        return jsonify({'message': 'Comment deleted successfully'}), 200
    except Exception as e:
        print("DELETE COMMENT ERROR:", e)
        return jsonify({'error': str(r)}), 500