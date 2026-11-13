"""
Module: Utility Package
Design name: Shared backend utility exports
Code date: 2026-11-12.
Programmer:

Purpose:
    Re-exports shared Supabase client creation/access and authenticated-user
    lookup for convenient imports in route modules.

Important functions:
    create_supabase_client() -> Supabase Client: imported from supabase_client;
        creates a client using configured environment values.
    get_authenticated_user() -> user or None: imported from auth_helpers;
        extracts and validates the current request's Supabase token.

Important data structures:
    `supabase` is the shared Supabase Client instance.

Algorithms and design choices:
    Package-level exports centralize common imports without duplicating
    client initialization or authentication logic in routes.
"""

from .supabase_client import supabase, create_supabase_client
from .auth_helpers import get_authenticated_user
