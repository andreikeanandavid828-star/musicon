from flask import Blueprint, request, jsonify
from utility import supabase, get_authenticated_user

tier_lists_bp = Blueprint('tier_lists', __name__)

# 1. Save or Create a Tier List
@tier_lists_bp.route('/', methods=['POST', 'OPTIONS'], strict_slashes=False)
def save_tier_list():
    if request.method == 'OPTIONS':
        return '', 200

    user = get_authenticated_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    title = data.get('title', 'Untitled Tier List')
    tiers = data.get('tiers', {})
    tier_names = data.get('tierNames', {})
    is_public = data.get('is_public', False)

    try:
        response = supabase.table('tier_lists').insert({
            'user_id': str(user.id),
            'title': title,
            'tiers': tiers,
            'tier_names': tier_names,
            'is_public': is_public
        }).execute()
        
        return jsonify({'message': 'Tier list saved successfully', 'tier_list': response.data[0]}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# 2. Get User's Saved Tier Lists (for Profile)
@tier_lists_bp.route('/me', methods=['GET', 'OPTIONS'], strict_slashes=False)
def get_my_tier_lists():
    if request.method == 'OPTIONS':
        return '', 200

    user = get_authenticated_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        response = supabase.table('tier_lists').select('*').eq('user_id', str(user.id)).order('created_at', desc=True).execute()
        return jsonify({'tier_lists': response.data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# 3. Get Single Tier List (Public or Owned)
@tier_lists_bp.route('/<tier_list_id>', methods=['GET', 'OPTIONS'], strict_slashes=False)
def get_tier_list_detail(tier_list_id):
    if request.method == 'OPTIONS':
        return '', 200

    try:
        response = supabase.table('tier_lists').select('*, users(username)').eq('id', tier_list_id).single().execute()
        
        if not response.data:
            return jsonify({'error': 'Tier list not found'}), 404

        tier_list = response.data
        user = get_authenticated_user()

        # Check permissions: must be public or owned by the logged-in user
        if not tier_list['is_public'] and (not user or str(user.id) != tier_list['user_id']):
            return jsonify({'error': 'Forbidden'}), 403

        return jsonify({'tier_list': tier_list}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
#4. Fetch all public tier lists (Public Feed)
@tier_lists_bp.route('/', methods=['GET', 'OPTIONS'], strict_slashes=False)
def get_public_tier_lists():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        response = (
            supabase.table('tier_lists')
            .select('*, users(username)')
            .eq('is_public', True)
            .order('created_at', desc=True)
            .execute()
        )
        return jsonify({'tier_lists': response.data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500 