"""
Module: Authentication Helpers
Design name: Request user identity utility
Code date: 2026-11-12.
Programmer:

Purpose:
    Provides a shared helper that resolves the current request's Supabase
    user from a session cookie or Bearer authorization header.

Important functions:
    get_authenticated_user() -> Supabase user or None:
        Input: current Flask request context. Output: validated Supabase user
        when a token is present and accepted, otherwise None.

Important data structures:
    Uses the `supabase-auth-token` cookie or an Authorization header string
    and the Supabase Auth user response object.

Algorithms and design choices:
    Cookie authentication is preferred, with a Bearer token as fallback.
    Token verification is delegated to Supabase Auth rather than locally
    decoding credentials.
"""

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
