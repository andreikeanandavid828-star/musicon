from flask import Blueprint, request, jsonify, current_app
from utility import supabase, get_authenticated_user

profile = Blueprint("profile", __name__)


def serialize_profile(user_data, profile_data):
    return {
        "username": user_data["username"],
        "bio": profile_data.get("bio") or "",
        "profilePicture": profile_data.get("profile_picture_path"),
        "bannerPicture": profile_data.get("banner_picture_path"),

        # These come from users, NOT profiles
        "isArtist": user_data.get("is_artist", False),
        "isAdmin": user_data.get("is_admin", False),

        # These will come from their respective tables later
        "followers": 0,
        "following": 0,
        "friends": 0,
        "ratings": 0,
        "tierLists": 0,
        "posts": 0
    }


@profile.route("/me", methods=["GET"])
def get_my_profile():
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        # Retrieve user information
        user_response = (
            supabase
            .table("users")
            .select("id, username, is_admin, is_artist")
            .eq("id", user.id)
            .maybe_single()
            .execute()
        )

        if not user_response.data:
            return jsonify({"error": "User not found"}), 404

        # Retrieve profile information
        profile_response = (
            supabase
            .table("profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybe_single()
            .execute()
        )

        if not profile_response.data:
            return jsonify({"error": "Profile not found"}), 404

        return jsonify({
            "profile": serialize_profile(
                user_response.data,
                profile_response.data
            )
        }), 200

    except Exception:
        current_app.logger.exception("GET PROFILE ERROR")
        return jsonify({
            "error": "Failed to retrieve profile"
        }), 500


@profile.route("/me", methods=["PATCH"])
def update_my_profile():
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "A valid JSON object is required"
        }), 400

    username = data.get("username")
    bio = data.get("bio")

    # Validate username
    if username is not None:
        if not isinstance(username, str):
            return jsonify({
                "error": "Username must be a string"
            }), 400

        username = username.strip()

        if len(username) < 3:
            return jsonify({
                "error": "Username must be at least 3 characters"
            }), 400

        if len(username) > 30:
            return jsonify({
                "error": "Username cannot exceed 30 characters"
            }), 400

    # Validate bio
    if bio is not None:
        if not isinstance(bio, str):
            return jsonify({
                "error": "Bio must be a string"
            }), 400

        bio = bio.strip()

        if len(bio) > 300:
            return jsonify({
                "error": "Bio cannot exceed 300 characters"
            }), 400

    if username is None and bio is None:
        return jsonify({
            "error": "No fields provided to update"
        }), 400

    try:
        # Update username in users table
        if username is not None:
            (
                supabase
                .table("users")
                .update({"username": username})
                .eq("id", user.id)
                .execute()
            )

        # Update bio in profiles table
        if bio is not None:
            (
                supabase
                .table("profiles")
                .update({"bio": bio})
                .eq("user_id", user.id)
                .execute()
            )

        # Retrieve updated user information
        user_response = (
            supabase
            .table("users")
            .select("id, username, is_admin, is_artist")
            .eq("id", user.id)
            .maybe_single()
            .execute()
        )

        if not user_response.data:
            return jsonify({"error": "User not found"}), 404

        # Retrieve updated profile information
        profile_response = (
            supabase
            .table("profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybe_single()
            .execute()
        )

        if not profile_response.data:
            return jsonify({"error": "Profile not found"}), 404

        return jsonify({
            "message": "Profile updated successfully",
            "profile": serialize_profile(
                user_response.data,
                profile_response.data
            )
        }), 200

    except Exception:
        current_app.logger.exception("UPDATE PROFILE ERROR")
        return jsonify({
            "error": "Failed to update profile"
        }), 500