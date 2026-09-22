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

#login route
@app.route('/login', methods=['POST'])
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

if __name__ == '__main__':
    app.run(debug=True)