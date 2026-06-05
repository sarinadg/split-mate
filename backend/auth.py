import os
import httpx
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv("backend/.env")

_security = HTTPBearer()

_SUPABASE_URL = os.getenv("SUPABASE_URL", "")
_SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_security),
) -> str:
    token = credentials.credentials
    response = httpx.get(
        f"{_SUPABASE_URL}/auth/v1/user",
        headers={
            "Authorization": f"Bearer {token}",
            "apikey": _SUPABASE_SERVICE_KEY,
        },
    )
    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return response.json()["id"]
