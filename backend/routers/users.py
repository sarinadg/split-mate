from fastapi import APIRouter, Depends, HTTPException
from backend.auth import get_current_user
from backend.database import supabase
from backend.models import UserCreate, UserResponse

router = APIRouter(prefix="/users", tags=["users"])


def _get_house_id(user_id: str) -> str | None:
    result = (
        supabase.table("house_members")
        .select("house_id")
        .eq("user_id", user_id)
        .execute()
    )
    return result.data[0]["house_id"] if result.data else None


@router.post("/me", response_model=UserResponse)
def create_or_update_user(body: UserCreate, user_id: str = Depends(get_current_user)):
    supabase.table("users").upsert({
        "id": user_id,
        "name": body.name,
        "initials": body.initials,
        "color": body.color,
        "handle": body.handle,
    }).execute()

    result = supabase.table("users").select("*").eq("id", user_id).execute()
    user = result.data[0]
    house_id = _get_house_id(user_id)
    return {**user, "house_id": house_id}


@router.get("/me", response_model=UserResponse)
def get_user(user_id: str = Depends(get_current_user)):
    result = supabase.table("users").select("*").eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User profile not found")
    user = result.data[0]
    house_id = _get_house_id(user_id)
    return {**user, "house_id": house_id}
