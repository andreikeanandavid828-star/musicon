from utility.supabase_client import supabase
from flask import request 

def get_authenticated_user_id():
    """Extract and verify the user ID from cookie or Authorization header."""
    token = request.cookies.get('supabase-auth-token')

    if not token and 'Authorization' in request.headers:
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
    if not token:
        return None
    
    try:
        user_res = supabase.auth.get_user(token)
        return user_res.user.id if user_res.user else None 
    except Exception:
        return None
