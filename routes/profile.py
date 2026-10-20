
import os
from uuid import uuid4

from flask import Blueprint, current_app, jsonify, request
from storage3 import SyncStorageClient
from utility import get_authenticated_user, supabase

profile = Blueprint("profile", __name__)

PROFILE_IMAGE_BUCKET = "profile-images"
MAX_IMAGE_SIZE = 5 * 1024 * 1024
USER_COLUMNS = "id, username, is_admin, is_artist"


def get_first_record(table, columns, filter_column, value):
    response = (
        supabase.table(table)
        .select(columns)
        .eq(filter_column, str(value))
        .maybe_single()
        .execute()
    )
    return response.data


def get_profile_records(user_id):
    user_data = get_first_record(
        "users", USER_COLUMNS, "id", user_id
    )

    profile_data = get_first_record(
        "profiles", "*", "user_id", user_id
    )

    return user_data, profile_data


def upload_profile_image(image_file, user_id, image_type):
    image_bytes = image_file.read(MAX_IMAGE_SIZE + 1)

    if len(image_bytes) > MAX_IMAGE_SIZE:
        raise ValueError("Image must be 5 MB or smaller.")

    if not image_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError("Uploaded image must be a PNG.")

    token = request.cookies.get("supabase-auth-token")

    if not token:
        authorization = request.headers.get("Authorization", "")

        if authorization.startswith("Bearer "):
            token = authorization[7:]

    if not token:
        raise ValueError("Authentication token is missing.")

    storage = SyncStorageClient(
        f"{os.environ['SUPABASE_URL'].rstrip('/')}/storage/v1",
        headers={
            "apikey": os.environ["SUPABASE_PUBLISHABLE_KEY"],
            "Authorization": f"Bearer {token}",
        },
    )

    path = f"{user_id}/{image_type}-{uuid4().hex}.png"

    storage.from_(PROFILE_IMAGE_BUCKET).upload(
        path=path,
        file=image_bytes,
        file_options={
            "content-type": "image/png",
            "upsert": "false",
        },
    )

    return path


def serialize_profile(user_data, profile_data):
    bucket = supabase.storage.from_(PROFILE_IMAGE_BUCKET)

    avatar_path = profile_data.get("profile_picture_path")
    banner_path = profile_data.get("banner_picture_path")

    return {
        "username": user_data["username"],
        "bio": profile_data.get("bio") or "",
        "profilePicture": (
            bucket.get_public_url(avatar_path)
            if avatar_path else None
        ),
        "bannerPicture": (
            bucket.get_public_url(banner_path)
            if banner_path else None
        ),
        "isArtist": user_data.get("is_artist", False),
        "isAdmin": user_data.get("is_admin", False),
        "followers": 0,
        "following": 0,
        "friends": 0,
        "ratings": 0,
        "tierLists": 0,
        "posts": 0,
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

        if not profile_response or not profile_response.data:
            return jsonify({"error": "Profile not found"}), 404
        
        # Count the user's posts dynamically from the posts table
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

    if request.mimetype == "multipart/form-data":
        data = request.form.to_dict()
    else:
        data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "A valid JSON object or form data is required"
        }), 400

    username = data.get("username")
    bio = data.get("bio")

    avatar_file = request.files.get("profile_picture")
    banner_file = request.files.get("banner_picture")

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

    if (
        username is None
        and bio is None
        and not avatar_file
        and not banner_file
    ):
        return jsonify({
            "error": "No fields provided to update"
        }), 400

    try:
        user_data, profile_data = get_profile_records(user.id)

        if user_data is None:
            return jsonify({"error": "User not found"}), 404

        if profile_data is None:
            return jsonify({"error": "Profile not found"}), 404

        profile_updates = {}

        if bio is not None:
            profile_updates["bio"] = bio

        if avatar_file:
            profile_updates["profile_picture_path"] = (
                upload_profile_image(
                    avatar_file, user.id, "avatar"
                )
            )

        if banner_file:
            profile_updates["banner_picture_path"] = (
                upload_profile_image(
                    banner_file, user.id, "banner"
                )
            )

        if username is not None:
            (
                supabase.table("users")
                .update({"username": username})
                .eq("id", str(user.id))
                .execute()
            )

        if profile_updates:
            (
                supabase.table("profiles")
                .update(profile_updates)
                .eq("user_id", str(user.id))
                .execute()
            )

        user_data, profile_data = get_profile_records(user.id)

        if user_data is None or profile_data is None:
            return jsonify({
                "error": "Updated profile could not be retrieved"
            }), 500

        return jsonify({
            "message": "Profile updated successfully",
            "profile": serialize_profile(
                user_data, profile_data
            ),
        }), 200

    except ValueError as error:
        return jsonify({
            "error": str(error)
        }), 400

    except Exception:
        current_app.logger.exception("UPDATE PROFILE ERROR")
        return jsonify({
            "error": "Failed to update profile"
        }), 500
