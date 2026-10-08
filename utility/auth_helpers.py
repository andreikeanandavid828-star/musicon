from flask import request
from .supabase_client import supabase 

def get_authenticated_user():
    """Extracts token from cookie or Authorization header and returns Supabase user objects."""
    token = request.cookies.get("supabase-auth-token")

    if not token and 'Authorization' in request.headers:
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer'):
            token = auth_header.split(' ')[1]

    if not token:
        return None
    
    try: 
        user_res = supabase.auth.get_user(token)
        return user_res.user if user_res else None
    except Exception:
        return None
    