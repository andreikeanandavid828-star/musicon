from flask import Flask, request, jsonify
from supabase import create_client, Client
import dotenv
import os

dotenv.load_dotenv()

app = Flask(__name__)

# Initialize Supabase client
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_PUBLISHABLE_KEY")

supabase: Client = create_client(url, key)

# Register Route
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

if __name__ == "__main__":
    app.run(debug=True)