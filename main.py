from flask import Flask, request, jsonify
from flask_cors import CORS
from routes.auth import auth

app = Flask(__name__)

CORS(
    app,
    origin="http://localhost:5173",
    supports_credentials=True)

app.register_blueprint(auth)

if __name__ == '__main__':
    app.run(debug=True)
