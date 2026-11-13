"""
Module: Album Routes
Design name: Albums API blueprint
Code date: 2026-11-12.
Programmer:

Purpose:
    Defines Flask API endpoints for listing and retrieving albums, creating
    albums, and adding songs to an album. Database reads and writes use the
    shared Supabase client; write endpoints require an authenticated user.

Important functions:
    get_albums() -> (Flask response, status):
        Input: Flask request; no URL parameters or JSON body.
        Output: JSON list of album records ordered by created_at descending
        with status 200; an empty OPTIONS response with status 200; or a JSON
        error with status 500.

    get_album_detail(album_id) -> (Flask response, status):
        Input: album_id from the URL.
        Output: JSON album record enriched with its songs and related posts
        (including post authors' usernames) with status 200; a not-found JSON
        response with status 404 when no album data is returned; an empty
        OPTIONS response with status 200; or a JSON error with status 500.

    create_album() -> (Flask response, status):
        Input: JSON object with title, artist or artist_name, and optional
        cover_image_url and release_year; authenticated user from the session.
        Output: JSON confirmation and created album with status 201; a JSON
        unauthorized, validation, or server error with status 401, 400, or 500;
        or an empty OPTIONS response with status 200.

    add_song_to_album(album_id) -> (Flask response, status):
        Input: album_id from the URL; JSON object with title, audio_url, and
        optional track_number; authenticated user from the session.
        Output: JSON confirmation and created song with status 201; a JSON
        unauthorized, validation, or server error with status 401, 400, or 500;
        or an empty OPTIONS response with status 200.

Important data structures:
    - Supabase table results expose records as response.data, a list of
      dictionaries; album details add songs and posts as list-valued fields.
    - Request payloads and JSON API responses are dictionaries.
    - Flask handlers return response-body/status-code tuples.

Algorithms and design choices:
    - Album listing delegates sorting to the database (created_at descending)
      to avoid loading all records merely to sort them in application memory.
    - Album detail performs one album lookup, then queries its songs and posts
      by album_id and attaches those result lists to the album dictionary.
    - Create operations validate required input and authentication before
      inserting a row. Direct Supabase queries keep these CRUD operations
      simple and avoid duplicating database filtering or sorting logic in
      Python.
"""

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
    
# Add a Sing to an Album Route
@albums_bp.route('/<album_id>/songs', methods=['POST','OPTIONS'], strict_slashes=False)
def add_song_to_album(album_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    # 1. Ensure the user is logged in
    user = get_authenticated_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    # 2. Grab the JSON payload sent from the frontend JSX after it uploaded the file
    data = request.get_json() or {}
    title = data.get('title')
    audio_url = data.get('audio_url') # The cloud storage link from supabase
    track_number = data.get('track_number')

    # 3. Validate required fields 
    if not title or not audio_url:
        return jsonify({'error': 'Song title and audio URL are required fields'}), 400
    
    try:
        # 4. Insert the text record into your PostgreSQL songs table
        response = supabase.table('songs').insert({
            'album_id': album_id,
            'title': title,
            'audio_url': audio_url,
            'track_number': track_number,
            'user_id': user.id
        }).execute()

        created_song = response.data[0] if response.data else {}
        return jsonify({
            'message': 'Song uploaded successfully',
            'song': created_song
        }), 201
    
    except Exception as e:
        print("ADD SONG ERROR:", e)
        return jsonify({'error': str(e)}), 500
