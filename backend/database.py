import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")

# Placeholders used during testing (tests mock supabase.table, so no real connection is made)
_url = os.getenv("SUPABASE_URL", "https://placeholder.supabase.co")
_key = os.getenv(
    "SUPABASE_SERVICE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIn0.placeholder",
)

supabase: Client = create_client(_url, _key)
