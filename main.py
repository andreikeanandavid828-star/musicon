import dotenv
dotenv.load_dotenv() #Load environment variables first

from flask import Flask
from flask_cors import CORS
from routes.auth import auth 
from routes.profile import profile
from forum import posts_bp

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)