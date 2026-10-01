from flask import Flask, request, jsonify
from routes.auth import auth
from flask_cors import CORS

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

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
