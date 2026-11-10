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
