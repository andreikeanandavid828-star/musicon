import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_PUBLISHABLE_KEY")

if not url or not key:
    raise ValueError("Missing Supabase environment variables")

def create_supabase_client() -> Client:
    return create_client(url, key)

# Existing client used by your application
supabase: Client = create_supabase_client()