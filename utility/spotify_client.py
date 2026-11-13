"""
Module: Spotify Client
Design name: Spotify Web API client utilities
Code date: 2026-11-12.
Programmer:

Purpose:
    Obtains and caches a Spotify client-credentials access token and converts
    Spotify track search results into the application's song shape.

Important functions:
    get_spotify_token() -> token string:
        Input: no arguments; reads Spotify client credentials from environment.
        Output: cached or newly acquired access token; raises RuntimeError
        when credentials are missing and propagates HTTP failures.
    search_spotify_tracks(query) -> list of dictionaries:
        Input: non-empty search query string. Output: up to ten normalized
        track records with Spotify IDs, title, artists, album, cover URL, and
        duration; propagates HTTP errors to the caller.

Important data structures:
    `_access_token` and `_token_expires_at` are module-level token cache
    values. Search output is a list of dictionaries; artist names are lists.

Algorithms and design choices:
    Token reuse avoids repeated token requests until shortly before expiry;
    the 60-second safety margin helps avoid using a token at its expiration.
    Spotify's first album image is selected when present, otherwise the cover
    URL is None. HTTP calls have finite timeouts.
"""

import os
import time
import requests

SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_URL = "https://api.spotify.com/v1"

_access_token = None
_token_expires_at = 0


def get_spotify_token():
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
