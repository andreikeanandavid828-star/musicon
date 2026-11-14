
"""
Module Name: Spotify Client Utility
Date: November 2026
Programmer: Andrei David

Description:
Handles Spotify API authentication and searches
for tracks using the Spotify Web API.
"""

import os
import time
import requests

SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_URL = "https://api.spotify.com/v1"

_access_token = None
_token_expires_at = 0


def get_spotify_token():
    """
    Retrieves a Spotify API access token.

    Inputs:
        None. Uses SPOTIFY_CLIENT_ID and
        SPOTIFY_CLIENT_SECRET environment variables.

    Output:
        str: A valid Spotify access token.
    """
    global _access_token, _token_expires_at

    # Reuse the token if it is still valid
    if _access_token and time.time() < _token_expires_at:
        return _access_token

    client_id = os.getenv("SPOTIFY_CLIENT_ID")
    client_secret = os.getenv("SPOTIFY_CLIENT_SECRET")

    if not client_id or not client_secret:
        raise RuntimeError("Spotify credentials are missing")

    response = requests.post(
        SPOTIFY_TOKEN_URL,
        data={"grant_type": "client_credentials"},
        auth=(client_id, client_secret),
        timeout=10
    )

    response.raise_for_status()
    data = response.json()

    _access_token = data["access_token"]
    _token_expires_at = (
        time.time() + data["expires_in"] - 60
    )

    return _access_token


def search_spotify_tracks(query):
    """
    Searches for tracks using the Spotify Web API.

    Inputs:
        query (str): Song title or search keyword.

    Output:
        list: Matching tracks with titles, artists,
        album details, cover images, and durations.
    """
    token = get_spotify_token()

    response = requests.get(
        f"{SPOTIFY_API_URL}/search",
        headers={
            "Authorization": f"Bearer {token}"
        },
        params={
            "q": query,
            "type": "track",
            "limit": 10
        },
        timeout=10
    )

    response.raise_for_status()
    data = response.json()

    tracks = data.get("tracks", {}).get("items", [])

    return [
        {
            "spotify_id": track["id"],
            "title": track["name"],
            "artists": [
                artist["name"]
                for artist in track["artists"]
            ],
            "album": track["album"]["name"],
            "album_spotify_id": track["album"]["id"],
            "cover_image_url": (
                track["album"]["images"][0]["url"]
                if track["album"]["images"]
                else None
            ),
            "duration_ms": track["duration_ms"]
        }
        for track in tracks
    ]
