
"""
Module Name: Authentication Utility
Date: September - October 2026
Programmer: Martin Reyes

Description:
Handles user authentication by retrieving and
validating Supabase authentication tokens.
"""

from flask import request
from .supabase_client import supabase 

def get_authenticated_user():
    """
    Retrieves the authenticated user using a Supabase token.

    Inputs:
        None. Reads the authentication token from
        request cookies or the Authorization header.

    Output:
        User or None: The authenticated Supabase user
        object, or None if authentication fails.
    """
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
