from flask import Blueprint, request, jsonify
from utility import supabase, get_authenticated_user

albums_bp = Blueprint('albums', __name__)  # Fixed: changed albums_bl to albums_bp

#Fetch All Albums Route
@albums_bp.route('/', methods=['GET', 'OPTIONS'], strict_slashes=False)
def get_albums():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        response = supabase.table('albums').select('*').order('created_at', desc=True).execute()  # Fixed: reponse -> response
        return jsonify(response.data), 200
    except Exception as e:
        print("GET ALBUMS ERROR:", e)
        return jsonify({'error': str(e)}), 500

#Get Single Album Detail Route
@albums_bp.route('/<album_id>', methods=['GET', 'OPTIONS'], strict_slashes=False)
def get_album_detail(album_id):
    if request.method == 'OPTIONS':
        return '', 200

    try:
        album_res = supabase.table('albums').select('*').eq('id', album_id).single().execute()
        
        if not album_res.data:
            return jsonify({'error': 'Album not found'}), 404

        songs_res = supabase.table('songs').select('*').eq('album_id', album_id).execute()
        posts_res = supabase.table('posts').select('*, users!posts_user_id_fkey(username)').eq('album_id', album_id).execute()

        album_data = album_res.data
        album_data['songs'] = songs_res.data
        album_data['posts'] = posts_res.data

        return jsonify(album_data), 200
    except Exception as e:
        print("GET ALBUM DETAIL ERROR:", e)
        return jsonify({'error': str(e)}), 500

#Create a New Album Route 
@albums_bp.route('/', methods=['POST', 'OPTIONS'], strict_slashes=False)
def create_album():
    if request.method == 'OPTIONS':
        return '', 200

    user = get_authenticated_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.get_json() or {}
    title = data.get('title')
    artist_name = data.get('artist') or data.get('artist_name') # Handles both frontend field names safely
    cover_image_url = data.get('cover_image_url')
    release_year = data.get('release_year')

    if not title or not artist_name:
        return jsonify({'error': 'Title and artist are required fields'}), 400

    try:
        response = supabase.table('albums').insert({
            'title': title,
            'artist_name': artist_name,  # Updated to match Supabase column name
            'cover_image_url': cover_image_url,
            'release_year': release_year,
            'user_id': user.id
        }).execute()

        created_album = response.data[0] if response.data else {}
        return jsonify({'message': 'Album created successfully', 'album': created_album}), 201
    except Exception as e:
        print("CREATE ALBUM ERROR:", e)
        return jsonify({'error': str(e)}), 500