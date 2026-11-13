"""
Module: Supabase Client
Design name: Supabase connection factory and shared client
Code date: 2026-11-12.
Programmer:

Purpose:
    Loads Supabase connection settings from environment variables, validates
    that required settings exist, and exposes a shared client.

Important functions:
    create_supabase_client() -> Client:
        Input: no arguments; uses module-level Supabase URL and publishable
        key. Output: initialized Supabase Client.

Important data structures:
    `url` and `key` are module-level configuration strings; `supabase` is
    the shared Client instance.

Algorithms and design choices:
    Configuration is read once during module initialization, and missing
    credentials raise ValueError immediately instead of allowing an
    unusable client to fail later.
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
    return create_client(url, key)

# Existing client used by your application
supabase: Client = create_supabase_client()