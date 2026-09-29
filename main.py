from flask import Flask, request, jsonify
from routes.auth import auth
from flask_cors import CORS

app = Flask(__name__)

CORS(
    app,
    origins="http://localhost:5173",
    supports_credentials=True
)


app.register_blueprint(auth)

if __name__ == '__main__':
    app.run(debug=True)

