from flask import Blueprint, request, jsonify
from utility import supabase, get_authenticated_user

profile = Blueprint("profile", __name__)

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_PUBLISHABLE_KEY")

supabase: Client = create_client(url, key)


def get_current_user():
    token = request.cookies.get("supabase-auth-token")

    if not token:
        return None

    try:
        response = supabase.auth.get_user(token)
        return response.user

    except Exception as e:
        print("AUTH ERROR:", e)
        return None


def serialize_profile(user_data, profile_data):
    return {
        "username": user_data["username"],
        "bio": profile_data.get("bio", ""),
        "profilePicture": None,
        "bannerPicture": None,

        "isArtist": profile_data.get("is_artist", False),

        # These will come from their respective tables later
        "followers": 0,
        "following": 0,
        "friends": 0,
        "ratings": 0,
        "tierLists": 0,
        "posts": 0
    }

# GET Profile
@profile.route("/me", methods=["GET"])
def get_my_profile():
    user = get_current_user()

    if not user:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    try:
        user_response = (
            supabase
            .table("users")
            .select("id, username")
            .eq("id", user.id)
            .maybe_single()
            .execute()
        )

        if not user_response.data:
            return jsonify({
                "error": "User not found"
            }), 404

        profile_response = (
            supabase
            .table("profiles")
            .select("*")
            .eq("user_id", user.id)
            .maybe_single()
            .execute()
        )

        # Create a default profile if one doesn't exist

        if not profile_response.data:
            return jsonify({
                "error": "Profile not found"
            }), 404

        else:
            profile_data = profile_response.data

        return jsonify({
            "profile": serialize_profile(
                user_response.data,
                profile_data
            )
        }), 200

    except Exception as e:
        print("GET PROFILE ERROR:", e)

        return jsonify({
            "error": "Failed to retrieve profile",
            "details": str(e)
        }), 500


# UPDATE profile
@profile.route("/me", methods=["PATCH"])
def update_my_profile():
    user = get_current_user()

    if not user:
        return jsonify({
            "error": "Unauthorized"
        }), 401

    try:
        username = request.form.get("username")
        bio = request.form.get("bio")

#        profile_picture = request.files.get("profile_picture")
#        banner_picture = request.files.get("banner_picture")

        # -------------------------
        # Username
        # -------------------------

        if username is not None:
            username = username.strip()

            if len(username) < 3:
                return jsonify({
                    "error": "Username must be at least 3 characters"
                }), 400

            if len(username) > 30:
                return jsonify({
                    "error": "Username cannot exceed 30 characters"
                }), 400

            (
                supabase
                .table("users")
                .update({
                    "username": username
                })
                .eq("id", user.id)
                .execute()
            )

        # -------------------------
        # Bio
        # -------------------------

        if bio is not None:
            bio = bio.strip()

            if len(bio) > 300:
                return jsonify({
                    "error": "Bio cannot exceed 300 characters"
                }), 400

            (
                supabase
                .table("profiles")
                .update({
                    "bio": bio
                })
                .eq("user_id", user.id)
                .execute()
            )

        # -------------------------
        # Images
        # -------------------------
        # Intentionally ignored for now.
        #
        # profile_picture contains the cropped avatar file.
        # banner_picture contains the cropped banner file.
        #
        # When you're ready for Supabase Storage, this is
        # where we'll upload them.

        # -------------------------
        # Return fresh profile
        # -------------------------

        user_response = (
            supabase
            .table("users")
            .select("id, username")
            .eq("id", user.id)
            .single()
            .execute()
        )

        profile_response = (
            supabase
            .table("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single()
            .execute()
        )

        return jsonify({
            "message": "Profile updated successfully",
            "profile": serialize_profile(
                user_response.data,
                profile_response.data
            )
        }), 200

    except Exception as e:
        print("UPDATE PROFILE ERROR:", e)

        return jsonify({
            "error": "Failed to update profile",
            "details": str(e)
        }), 500