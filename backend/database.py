import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv("backend/.env")

supabase: Client = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_KEY"],
)
