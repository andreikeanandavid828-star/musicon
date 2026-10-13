from flask import Blueprint, request, jsonify
from utility import supabase

auth = Blueprint("auth", __name__)

#Register Route
@auth.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirmPassword')
    username = data.get('username')
    email = data.get('email')
    first_name = data.get('firstName')
    last_name = data.get('lastName')

    # Enfore validation checks from your friend's code 
    if not username or not password or not email:
        return jsonify({"error": "Username, email, and password are required"}), 400
    
    if password != confirm_password:
        return jsonify({"error": "Passwords do not match"}), 400 

    try:
        # Sign up user and pass extra info into Supabase metadata options
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
            return jsonify({"error": "Failed to create user"}), 400

        return jsonify({
            "message": "User registered successfully",
            "user_id": user.id
        }), 201

    except Exception as e:
        print("REGISTER ERROR:", e)
        return jsonify({
            "error": "Failed to register user",
            "details": str(e)
        }), 500

#Login Route
@auth.route('/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        if auth_response.user and auth_response.session:
            flask_response = jsonify({
                "message": "Login successful",
                "user_id": auth_response.user.id,
            })

            flask_response.set_cookie(
                "supabase-auth-token",
                auth_response.session.access_token,
                httponly=True,
                samesite="Lax"
            )

            return flask_response, 200

        return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        print("LOGIN ERROR:", e)
        return jsonify({"error": "Failed to login"}), 500


#Logout Route
@auth.route('/logout', methods=['POST', 'OPTIONS'])
def logout():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        response = jsonify({"message": "Logout successful"})
        response.set_cookie("supabase-auth-token", "", expires=0, httponly=True)
        return response, 200
    except Exception as e:
        print("LOGOUT ERROR:", e)
        return jsonify({"error": "Failed to logout"}), 500
