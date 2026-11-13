"""
Module: Song Search Routes
Design name: Search API blueprint
Code date: 2026-11-12.
Programmer:

Purpose:
    Provides a paginated case-insensitive song-title search endpoint backed
    by Supabase.

Important functions:
    search_songs() -> (JSON response, HTTP status):
        Input: query parameters `q` (text, maximum 100 characters) and
        `page` (positive integer, default 1).
        Output: JSON songs, total count, page, total_pages, and has_next;
        empty result metadata for a blank query; or JSON validation/database
        errors with the corresponding status.

Important data structures:
    PAGE_SIZE is 20. Each song result is a dictionary with selected song
    fields and related album fields. The response is a dictionary containing
    the result list and pagination metadata.

Algorithms and design choices:
    SQL LIKE wildcard characters in user input are escaped before surrounding
    the query with `%` for substring matching. Page number is converted to
    zero-based inclusive Supabase range indexes. Exact count and stable
    title/id ordering support predictable page metadata and pagination.
"""

from flask import Blueprint, request, jsonify
from utility import supabase

search_bp = Blueprint("search", __name__)

PAGE_SIZE = 20

@search_bp.route("/songs", methods=["GET"])
def search_songs():
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
                "duration_ms, explicit, year, "
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
