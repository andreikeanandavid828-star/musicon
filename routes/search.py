
"""
Module Name: Search
Date: November 2026
Programmer: Andrei David

Description:
Handles searching for songs and artists using
Flask and Supabase with paginated results.
"""

from flask import Blueprint, request, jsonify
from utility import supabase

search_bp = Blueprint("search", __name__)

PAGE_SIZE = 20


@search_bp.route("/songs", methods=["GET"])
def search_songs():
    """
    Searches for songs by title using Supabase.

    Inputs:
        q (str): Song title or search keyword.
        page (int): Page number for search results.

    Output:
        JSON response containing matching songs,
        total results, page information, and errors.
    """
    try:
        query = request.args.get("q", "").strip()
        page = request.args.get("page", default=1, type=int)

        if page is None or page < 1:
            return jsonify({
                "error": "Page must be a positive integer"
            }), 400

        if len(query) > 100:
            return jsonify({
                "error": "Search query must be 100 characters or less"
            }), 400

        if not query:
            return jsonify({
                "songs": [],
                "total": 0,
                "page": page,
                "total_pages": 0,
                "has_next": False
            }), 200

        # Escape SQL LIKE wildcards
        escaped_query = (
            query
            .replace("\\", "\\\\")
            .replace("%", "\\%")
            .replace("_", "\\_")
            .replace("*", "\\*")
        )

        # Supabase ranges use zero-based, inclusive indexes.
        start = (page - 1) * PAGE_SIZE
        end = start + PAGE_SIZE - 1

        result = (
            supabase.table("songs")
            .select(
                "id, title, artist_name, album_id, "
                "duration_ms, explicit, year, genre, "
                "albums(id, title, cover_image_url)",
                count="exact"
            )
            .ilike("title", f"%{escaped_query}%")
            .order("title")
            .order("id")
            .range(start, end)
            .execute()
        )

        songs = result.data or []
        total = result.count or 0

        total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE

        return jsonify({
            "songs": songs,
            "total": total,
            "page": page,
            "total_pages": total_pages,
            "has_next": page < total_pages
        }), 200

    except Exception as error:
        print("SEARCH ERROR:", error)

        return jsonify({
            "error": "Failed to search songs"
        }), 500


@search_bp.route("/artists", methods=["GET"])
def search_artists():
    """
    Searches for artists by name using Supabase.

    Inputs:
        q (str): Artist name or search keyword.
        page (int): Page number for search results.

    Output:
        JSON response containing matching artists,
        total results, page information, and errors.
    """
    try:
        query = request.args.get("q", "").strip()
        page = request.args.get("page", default=1, type=int)

        if page is None or page < 1:
            return jsonify({
                "error": "Page must be a positive integer"
            }), 400

        if len(query) > 100:
            return jsonify({
                "error": "Search query must be 100 characters or less"
            }), 400

        if not query:
            return jsonify({
                "artists": [],
                "total": 0,
                "page": page,
                "total_pages": 0,
                "has_next": False
            }), 200

        # Escape LIKE wildcard characters
        escaped_query = (
            query
            .replace("\\", "\\\\")
            .replace("%", "\\%")
            .replace("_", "\\_")
            .replace("*", "\\*")
        )

        PAGE_SIZE = 20

        start = (page - 1) * PAGE_SIZE
        end = start + PAGE_SIZE - 1

        result = (
            supabase.table("artists")
            .select(
                "id, name, image_url",
                count="exact"
            )
            .ilike("name", f"%{escaped_query}%")
            .order("name")
            .order("id")
            .range(start, end)
            .execute()
        )

        artists = result.data or []
        total = result.count or 0
        total_pages = (total + PAGE_SIZE - 1) // PAGE_SIZE

        return jsonify({
            "artists": artists,
            "total": total,
            "page": page,
            "total_pages": total_pages,
            "has_next": page < total_pages
        }), 200

    except Exception as error:
        print("ARTIST SEARCH ERROR:", error)

        return jsonify({
            "error": "Failed to search artists"
        }), 500
