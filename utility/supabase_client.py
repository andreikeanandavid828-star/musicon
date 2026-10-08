import os 
import dotenv
from supabase import create_client, Client

dotenv.load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_PUBLISHABLE_KEY")

if not url or not key: 
    raise ValueError("SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY must be set in environment variables.")

supabase: Client = create_client(url, key)
