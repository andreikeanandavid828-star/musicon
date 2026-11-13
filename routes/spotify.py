"""
Module: Spotify Search Routes
Design name: Spotify API blueprint
Code date: 2026-11-12.
Programmer:

Purpose:
    Validates incoming track-search requests and adapts Spotify service
    results and upstream errors into the application's JSON API.

Important functions:
    search_tracks() -> (JSON response, HTTP status):
        Input: query parameter `q`, trimmed and limited to 1-100 characters.
        Output: JSON song list with status 200; validation error 400; upstream
        Spotify failures as 502, including 429 rate limits and Retry-After;
        or a generic service error 500.

Important data structures:
    Spotify track results are returned as a list of song dictionaries.
    Error responses are JSON dictionaries; rate-limit responses may include
    a Retry-After header.

Algorithms and design choices:
    The route validates length before making an upstream call, then delegates
    token management and result normalization to utility.spotify_client.
    RequestException is handled separately to distinguish upstream outages
    and rate limiting from unexpected local errors.
"""

from flask import Blueprint, request, jsonify
from requests.exceptions import RequestException

from utility.spotify_client import search_spotify_tracks

spotify_bp = Blueprint("spotify", __name__)


@spotify_bp.route("/search", methods=["GET"])
def search_tracks():
    query = request.args.get("q", "").strip()

    if not query or len(query) > 100:
        return jsonify({
            "error": "Search query must contain 1–100 characters"
        }), 400

    try:
        songs = search_spotify_tracks(query)

        return jsonify({
            "songs": songs
        }), 200

    except RequestException as error:
        status = (
            error.response.status_code
            if error.response is not None
            else 502
        )

        print("SPOTIFY API ERROR:", error)

        if status == 429:
            response = jsonify({
                "error": "Spotify rate limit exceeded"
            })
            response.status_code = 429

            retry_after = error.response.headers.get(
                "Retry-After"
            )
            if retry_after:
                response.headers["Retry-After"] = retry_after

            return response

        return jsonify({
            "error": "Spotify request failed"
        }), 502

    except Exception as error:
        print("SPOTIFY ERROR:", error)

        return jsonify({
            "error": "Unable to search Spotify"
        }), 500
