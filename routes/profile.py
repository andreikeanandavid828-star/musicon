from flask import Blueprint, request, jsonify, current_app
from utility import supabase, get_authenticated_user
# Adding some imports for profile picture and banner picture handling
import os
from uuid import uuid4
from storage3 import SyncStorageClient

profile = Blueprint("profile", __name__)

# Adding some stuff for profile picture and banner picture handling
# Supabase Storage bucket for profile images.
PROFILE_IMAGE_BUCKET = "profile-images"
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB


def upload_profile_image(image_file, user_id, image_type):
    # Read the cropped image and validate it.
    image_bytes = image_file.read(MAX_IMAGE_SIZE + 1)

    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise ValueError("Image must be 5 MB or smaller.")

    # Our frontend crop editor exports PNG files.
    if not image_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError("Uploaded image must be a PNG.")

    # Use the authenticated user's token for Storage RLS.
    token = request.cookies.get("supabase-auth-token")

    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]

    if not token:
        raise ValueError("Authentication token is missing.")

    storage_client = SyncStorageClient(
        f"{os.environ['SUPABASE_URL'].rstrip('/')}/storage/v1",
        headers={
            "apikey": os.environ["SUPABASE_PUBLISHABLE_KEY"],
            "Authorization": f"Bearer {token}",
        },
    )

    # Unique names avoid overwrites and browser cache problems.
    file_path = f"{user_id}/{image_type}-{uuid4().hex}.png"

    storage_client.from_(PROFILE_IMAGE_BUCKET).upload(
        path=file_path,
        file=image_bytes,
        file_options={
            "content-type": "image/png",
            "upsert": "false",
        },
    )

    return file_path
# end of stuff added for profile picture and banner picture handling

def serialize_profile(user_data, profile_data):
    # Get stored image paths from the profiles table
    avatar_path = profile_data.get("profile_picture_path")
    banner_path = profile_data.get("banner_picture_path")

    # Convert storage paths into public URLs
    bucket = supabase.storage.from_(PROFILE_IMAGE_BUCKET)

    avatar_url = bucket.get_public_url(avatar_path) if avatar_path else None
    banner_url = bucket.get_public_url(banner_path) if banner_path else None
    
    return {
        "username": user_data["username"],
        "bio": profile_data.get("bio") or "",
        "profilePicture": avatar_url,
        "bannerPicture": banner_url,
        #"profilePicture": profile_data.get("profile_picture_path"),
        #"bannerPicture": profile_data.get("banner_picture_path"),        

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

        if not user_response or not user_response.data:
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

        # Safely check if response is None or data is empty
        if not profile_response or not profile_response.data:
            return jsonify({"error": "Profile not found"}), 404
        
        # ----> NEW: Count the user's posts dynamically from the posts table
        post_count_res = (
            supabase
            .table("posts")
            .select("*", count="exact", head=True)
            .eq("user_id", user.id)
            .execute()
        )
        total_posts = post_count_res.count if post_count_res.count is not None else 0

        # Serialize profile and inject the real post count 
        profile_data = serialize_profile(
            user_response.data,
            profile_response.data
        )
        profile_data["posts"] = total_posts
        
        return jsonify({"profile": profile_data}), 200

    except Exception:
        current_app.logger.exception("GET PROFILE ERROR")
        return jsonify({
            "error": "Failed to retrieve profile"
        }), 500

@profile.route("/me", methods=["PATCH"])

def update_my_profile():
    try:
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

        if username is not None:
            if not isinstance(username, str):
                return jsonify({
                    "error": "Username must be a string"
                }), 400

            username = username.strip()

            if not 3 <= len(username) <= 30:
                return jsonify({
                    "error": "Username must be 3-30 characters"
                }), 400

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

        # Verify both records exist before updating
        user_data = get_first_record(
            "users",
            "id, username, is_admin, is_artist",
            "id",
            user.id
        )

        if user_data is None:
            return jsonify({"error": "User not found"}), 404

        profile_data = get_first_record(
            "profiles",
            "*",
            "user_id",
            user.id
        )

        if profile_data is None:
            return jsonify({"error": "Profile not found"}), 404

        # Update username
        if username is not None:
            supabase.table("users").update({
                "username": username
            }).eq("id", str(user.id)).execute()

        # Update bio
        if bio is not None:
            supabase.table("profiles").update({
                "bio": bio
            }).eq("user_id", str(user.id)).execute()

        # Retrieve updated information
        user_data = get_first_record(
            "users",
            "id, username, is_admin, is_artist",
            "id",
            user.id
        )

        profile_data = get_first_record(
            "profiles",
            "*",
            "user_id",
            user.id
        )

        if user_data is None or profile_data is None:
            return jsonify({
                "error": "Updated profile could not be retrieved"
            }), 500

        return jsonify({
            "message": "Profile updated successfully",
            "profile": serialize_profile(
                user_data,
                profile_data
            )
        }), 200

    except Exception:
        current_app.logger.exception("UPDATE PROFILE ERROR")

        return jsonify({
            "error": "Failed to update profile"
        }), 500
    
def update_my_profile():
    user = get_authenticated_user()

    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    #data = request.get_json(silent=True)

    #if not isinstance(data, dict):
    #    return jsonify({
    #        "error": "A valid JSON object is required"
    #    }), 400

    # replace the above lines with the following to support both JSON and multipart form data
    # Support both the existing JSON requests and
    # multipart form submissions containing images.
    if request.mimetype == "multipart/form-data":
        data = request.form.to_dict()
    else:
        data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "A valid JSON object or form data is required"
        }), 400

    avatar_file = request.files.get("profile_picture")
    banner_file = request.files.get("banner_picture")
    # end of new stuff added for profile picture and banner picture handling

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

        # added avatar and banner file validation
        if ( username is None
            and bio is None
            and not avatar_file
            and not banner_file
        ):
            return jsonify({
                "error": "No fields provided to update"
        }), 400

    try:
        # changed for profile picture and banner picture handling
        # Collect changes to the profiles table.
        profile_updates = {}

        if bio is not None:
            profile_updates["bio"] = bio

        # Upload cropped profile picture.
        if avatar_file:
            avatar_path = upload_profile_image(
                avatar_file,
                user.id,
                "avatar",
            )
            profile_updates["profile_picture_path"] = avatar_path

        # Upload cropped banner picture.
        if banner_file:
            banner_path = upload_profile_image(
                banner_file,
                user.id,
                "banner",
            )
            profile_updates["banner_picture_path"] = banner_path

        # Preserve the existing username update.
        if username is not None:
            (
                supabase
                .table("users")
                .update({"username": username})
                .eq("id", user.id)
                .execute()
            )

        # Save bio and image paths to profiles.
        if profile_updates:
            (
                supabase
                .table("profiles")
                .update(profile_updates)
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
    
    except ValueError as error:
        return jsonify({"error": str(error)}), 400


    except Exception:
        current_app.logger.exception("UPDATE PROFILE ERROR")
        return jsonify({
            "error": "Failed to update profile"
        }), 500