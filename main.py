from flask import Flask, request, jsonify
from routes.auth import auth
from routes.post import posts_bp
from flask_cors import CORS

app = Flask(__name__)

CORS(
    app,
    origins="http://localhost:5173",
    supports_credentials=True
)


app.register_blueprint(auth)

app.register_blueprint(posts_bp, url_prefix= '/api/posts')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

