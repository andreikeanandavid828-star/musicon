from flask import Blueprint, request, jsonify
from supabase import create_client, Client
import dotenv
import os

dotenv.load_dotenv()

auth = Blueprint("auth", __name__)

# Initialize Supabase client
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_PUBLISHABLE_KEY")

supabase: Client = create_client(url, key)

# Register Route
@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    confirm_password = data.get('confirmPassword')
    email = data.get('email')
    first_name = data.get('firstName')
    last_name = data.get('lastName')

#    if not username or not password:
#        return jsonify({"error": "Username and password are required"}), 400

#    if password != confirm_password:
#        return jsonify({"error": "Passwords do not match"}), 400

    try:
        auth_response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                 "data": {
                     "username": username,
                     "first_name": first_name,
                     "last_name": last_name
                 }
             }
        })

        user = auth_response.user

        if not user:
            return jsonify({
                "error": "Failed to create user"
            }), 400

        return jsonify({
            "message": "User registered successfully",
            "user_id": user.id
        }), 201

        print("Auth user created:", user.id)    
    
    except Exception as e:
        print("REGISTER ERROR:", e)

        return jsonify({
            "error": "Failed to register user",
            "details": str(e)
        }), 500

# Login Route
@auth.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if auth_response.user or auth_response.session:
            flask_response = jsonify({
                "message": "Login successful",
                "user_id": auth_response.user.id,
            })

            flask_response.set_cookie(
                "supabase-auth-token",
                auth_response.session.access_token,
                httponly=True,
            )

            return flask_response, 200

        else:
            return jsonify({
                "error": "Invalid credentials"
            }), 401

    except Exception as e:
        print("LOGIN ERROR:", e)
        return jsonify({
            "error": "Failed to login"
        }), 500

# Logout Route
@auth.route('/logout', methods=['POST'])
def logout():
    try:
        # Clear the Supabase auth token cookie
        response = jsonify({"message": "Logout successful"})
        response.set_cookie("supabase-auth-token", "", expires=0, httponly=True)
        return response, 200

    except Exception as e:
        print("LOGOUT ERROR:", e)
        return jsonify({
            "error": "Failed to logout"
        }), 500

