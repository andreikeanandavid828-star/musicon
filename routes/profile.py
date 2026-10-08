from flask import Blueprint, request, jsonify
from utility import supabase, get_authenticated_user

profile = Blueprint("profile", __name__)

@profile.route('/bioInput', methods=['POST'])
def bioInput():
    user = get_authenticated_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}
    bio = data.get('bio')

    if not bio:
        return jsonify({"error": "Bio is required"}), 400

    try:
        # Example Supabase update/upsert
        response = supabase.table('profiles').upsert({
            'id': user.id,
            'bio': bio
        }).execute()

        return jsonify({"message": "Bio updated successfully", "data": response.data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500