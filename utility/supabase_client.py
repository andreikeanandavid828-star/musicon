
"""
Module Name: Supabase Utility
Date: October - November 2026
Programmer: Andrei David, Martin Reyes

Description:
Loads Supabase environment variables and creates
a Supabase client for database operations.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_PUBLISHABLE_KEY")

if not url or not key:
    raise ValueError("Missing Supabase environment variables")


def create_supabase_client() -> Client:
    """
    Creates a new Supabase client using environment variables.

    Inputs:
        None. Uses SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.

    Output:
        Client: A new Supabase client instance.
    """
    return create_client(url, key)


# Existing client used by your application
supabase: Client = create_supabase_client()
