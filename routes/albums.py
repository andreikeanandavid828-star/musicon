from flask import Blueprint, request, jsonify
from utility import supabase, get_authenticated_user

albums_bl = Blueprint('albums', __name__)

#Fetch All Albums Route
@albums_bp.route('/', methods=['GET', 'OPTIONS'], strict_slashes=False)
def get_albums():
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        reponse = supabase.table('albums').select('*').order('created_at', desc=True).execute()
        return jsonify(response.data),200
    except Exception as e:
        print("GET ALBUMS ERROR:", e)
        return jsonify({'error': str(e)}), 500

#Get Single Album Detail Route
@albums_bp.route('/<album_id', methods=['GET', 'OPTIONS'], strict_slashes=False)
def get_album_detail(album_id):
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        album_res = supabase.table('albums').select('*').eq('id', album_id).single().execute()