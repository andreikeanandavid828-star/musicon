
from flask import Blueprint, request, jsonify
from utility import supabase

library_bp = Blueprint("library", __name__)


@library_bp.route("/userSongs", methods=["POST"])
def add_library_song():
    """
    Adds a song to a user's library.

    Inputs:
        user_id (uuid): User adding the song.
        song_id (uuid): Song to add.

    Output:
        JSON response containing the saved song.
    """
    try:
        data = request.get_json(silent=True) or {}

        user_id = data.get("user_id")
        song_id = data.get("song_id")

        if not user_id or not song_id:
            return jsonify({
                "error": "user_id and song_id are required"
            }), 400

        result = (
            supabase.table("user_library_songs")
            .upsert(
                {
                    "user_id": user_id,
                    "song_id": song_id
                },
                on_conflict="user_id,song_id",
                ignore_duplicates=True
            )
            .execute()
        )

        return jsonify({
            "message": "Song added to library",
            "data": result.data
        }), 200

    except Exception as error:
        print("ADD LIBRARY SONG ERROR:", error)

        return jsonify({
            "error": "Failed to add song to library"
        }), 500


@library_bp.route("/userSongs/<song_id>", methods=["DELETE"])
def remove_library_song(song_id):
    """
    Removes a song from a user's library.

    Inputs:
        song_id (uuid): Song to remove.
        user_id (uuid): User removing the song.

    Output:
        JSON response confirming removal or errors.
    """
    try:
        data = request.get_json(silent=True) or {}
        user_id = data.get("user_id")

        if not user_id:
            return jsonify({
                "error": "user_id is required"
            }), 400

        result = (
            supabase.table("user_library_songs")
            .delete()
            .eq("user_id", user_id)
            .eq("song_id", song_id)
            .execute()
        )

        if not result.data:
            return jsonify({
                "error": "Song not found in user's library"
            }), 404

        return jsonify({
            "message": "Song removed from library"
        }), 200

    except Exception as error:
        print("REMOVE LIBRARY SONG ERROR:", error)

        return jsonify({
            "error": "Failed to remove song from library"
        }), 500



@library_bp.route("/userSongs", methods=["GET"])
def get_library_songs():
    """
    Retrieves songs from a user's library.

    Inputs:
        user_id (uuid): User whose library to retrieve.
        page (int): Page number for pagination.

    Output:
        JSON response containing saved songs,
        total results, and pagination information.
    """
    try:
        user_id = request.args.get("user_id")
        page = request.args.get("page", default=1, type=int)

        if not user_id:
            return jsonify({
                "error": "user_id is required"
            }), 400

        if page is None or page < 1:
            return jsonify({
                "error": "Page must be a positive integer"
            }), 400

        PAGE_SIZE = 20

        start = (page - 1) * PAGE_SIZE
        end = start + PAGE_SIZE - 1

        result = (
            supabase.table("user_library_songs")
            .select(
                "added_at, "
                "songs("
                "id, title, artist_name, album_id, "
                "duration_ms, explicit, year, genre, popularity, "
                "albums(id, title, cover_image_url)"
                ")",
                count="exact"
            )
            .eq("user_id", user_id)
            .order("added_at", desc=True)
            .order("song_id")
            .range(start, end)
            .execute()
        )

        library_entries = result.data or []
        total = result.count or 0

        songs = [
            {
                **entry["songs"],
                "added_at": entry["added_at"]
            }
            for entry in library_entries
            if entry.get("songs")
        ]

        total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE

        return jsonify({
            "songs": songs,
            "total": total,
            "page": page,
            "total_pages": total_pages,
            "has_next": page < total_pages
        }), 200

    except Exception as error:
        print("GET LIBRARY SONGS ERROR:", error)

        return jsonify({
            "error": "Failed to retrieve library songs"
        }), 500
