"""
Module: Application Entry Point
Design name: Flask application bootstrap
Code date: 2026-11-12.
Programmer:

Purpose:
    Loads environment configuration, creates the Flask application, enables
    credentialed CORS for local frontend origins, registers API blueprints,
    and runs the development server when executed directly.

Important functions:
    No custom functions are defined. Module-level initialization creates
    `app` for WSGI use and registers auth, profile, forum, album, Spotify, and
    search routes. The `__main__` block starts the development server on
    0.0.0.0:5000 with debug enabled; it takes no arguments and returns no
    application-level value.

Important data structures:
    `app` is a Flask application object. CORS origins and blueprint URL
    prefixes are configured as lists/strings at module scope.

Algorithms and design choices:
    Environment loading occurs before application and route imports so config
    values are available during client initialization. Flask blueprints
    provide modular route registration; no custom algorithm is used.
"""

import dotenv
dotenv.load_dotenv() #Load environment variables first

from flask import Flask
from flask_cors import CORS
from routes.auth import auth 
from routes.profile import profile
from routes.forum import posts_bp
from routes.albums import albums_bp
from routes.spotify import spotify_bp
from routes.search import search_bp

app = Flask(__name__)

CORS(
    app,
    origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
    ],
    supports_credentials=True
)

app.register_blueprint(auth, url_prefix="/api/auth")
app.register_blueprint(profile, url_prefix="/profile") 
app.register_blueprint(posts_bp, url_prefix="/api/posts")
app.register_blueprint(albums_bp, url_prefix="/api/albums")
app.register_blueprint(spotify_bp, url_prefix="/api/spotify")
app.register_blueprint(search_bp, url_prefix="/api/search")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)