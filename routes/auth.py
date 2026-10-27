from flask import Blueprint, request, jsonify
from utility import supabase, create_supabase_client

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


# Forgot Password Route
@auth.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = str(data.get('email') or '').strip()

    if not email:
        return jsonify({"error": "Email is required"}), 400

    try:
        client = create_supabase_client()

        client.auth.reset_password_for_email(
            email,
            {
                "redirect_to": "http://localhost:5173/reset-password"
            }
        )

        return jsonify({
            "message": "If an account exists with this email, a password reset link has been sent."
        }), 200

    except Exception as e:
        print("PASSWORD RESET ERROR:", type(e).__name__)

        return jsonify({
            "error": "Unable to send reset email. Please try again."
        }), 500


# Reset Password Route
@auth.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json(silent=True) or {}

    token_hash = data.get('token_hash')
    password = data.get('password')

    if not token_hash or not password:
        return jsonify({
            "error": "Missing recovery token or password"
        }), 400

    if len(password) < 8:
        return jsonify({
            "error": "Password must be at least 8 characters"
        }), 400

    try:
        client = create_supabase_client()

        # Verify the recovery token with Supabase
        auth_response = client.auth.verify_otp({
            "token_hash": token_hash,
            "type": "recovery"
        })

        if not auth_response.user or not auth_response.session:
            return jsonify({
                "error": "Invalid or expired recovery link"
            }), 400

        # The verified session belongs to the user
        # who requested the password reset.
        result = client.auth.update_user({
            "password": password
        })

        if not result.user:
            return jsonify({
                "error": "Could not update password"
            }), 400

        # Clear the temporary recovery session
        client.auth.sign_out()

        return jsonify({
            "message": "Password updated successfully!"
        }), 200

    except Exception as e:
        print("PASSWORD UPDATE ERROR:", type(e).__name__)

        return jsonify({
            "error": "Unable to reset password. The link may be expired or already used."
        }), 400