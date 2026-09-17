from flask import Flask, request, jsonify
from supabase import create_client, Client
from werkzeug.security import generate_password_hash
import dotenv
import os

dotenv.load_dotenv()

app = Flask(__name__)

# Initialize Supabase client
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(url, key)

# Register route
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    if password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400

    # Hash the password before storing it
    hashed_password = generate_password_hash(password)

    # Insert the new user into the Supabase database
    response = supabase.table('users').insert({
        'username': username,
        'password_hash': hashed_password,
        'email': email,
        'first_name': first_name,
        'last_name': last_name
    }).execute()

    if response.status_code == 201:
        return jsonify({"message": "User registered successfully"}), 201
    else:
        return jsonify({"error": "Failed to register user"}), 500