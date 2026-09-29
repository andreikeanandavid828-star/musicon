from flask import Flask, request, jsonify
from supabase import create_client, Client
import dotenv
import os

dotenv.load_dotenv()

app = Flask(__name__)

# Logout Route
@app.route('/logout', methods=['POST'])
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

if __name__ == '__main__':
    app.run(debug=True)
