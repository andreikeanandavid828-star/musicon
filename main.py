from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.auth import auth
from routes.post import posts_bp
from routes.profile import profile

app = Flask(__name__)

CORS(
    app,
    origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
        "http://localhost:5178",
    ],
    supports_credentials=True
)

app.register_blueprint(auth)

app.register_blueprint(profile)

app.register_blueprint(posts_bp, url_prefix= '/api/posts')

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
