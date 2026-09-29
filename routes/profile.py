from flask import Blueprint, request, jsonify
from supabase import create_client, Client
import dotenv
import os

dotenv.load_dotenv()

profile = Blueprint("profile", __name__)

# Initialize Supabase client
url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_PUBLISHABLE_KEY")

supabase: Client = create_client(url, key)

@profile.route('/bioInput', methods=['GET'])
def bioInput():
    data = request.get_json()
    bio = data.get('bio')
    