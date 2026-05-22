import random
import string
from fastapi import APIRouter, Depends, HTTPException
from backend.auth import get_current_user
from backend.database import supabase
from backend.models import HouseCreate, HouseJoin, HouseResponse, UserResponse

router = APIRouter(prefix="/houses", tags=["houses"])


def _generate_code() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


def _get_members(house_id: str) -> list[dict]:
    memberships = (
        supabase.table("house_members")
        .select("user_id")
        .eq("house_id", house_id)
        .execute()
    )
    ids = [m["user_id"] for m in memberships.data]
    if not ids:
        return []
    users = supabase.table("users").select("*").in_("id", ids).execute()
    return [{**u, "house_id": house_id} for u in users.data]


@router.post("", response_model=HouseResponse)
def create_house(body: HouseCreate, user_id: str = Depends(get_current_user)):
    existing = (
        supabase.table("house_members")
        .select("house_id")
        .eq("user_id", user_id)
        .execute()
    )
    if existing.data:
        raise HTTPException(status_code=400, detail="User already belongs to a house")

    house = (
        supabase.table("houses")
        .insert({"name": body.name, "code": _generate_code()})
        .execute()
        .data[0]
    )
    supabase.table("house_members").insert(
        {"house_id": house["id"], "user_id": user_id}
    ).execute()

    return {**house, "members": _get_members(house["id"])}


@router.post("/join", response_model=HouseResponse)
def join_house(body: HouseJoin, user_id: str = Depends(get_current_user)):
    result = (
        supabase.table("houses")
        .select("*")
        .eq("code", body.code.upper())
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="House not found — check the code")

    house = result.data[0]
    already = (
        supabase.table("house_members")
        .select("user_id")
        .eq("house_id", house["id"])
        .eq("user_id", user_id)
        .execute()
    )
    if not already.data:
        supabase.table("house_members").insert(
            {"house_id": house["id"], "user_id": user_id}
        ).execute()

    return {**house, "members": _get_members(house["id"])}


@router.get("/{house_id}", response_model=HouseResponse)
def get_house(house_id: str, user_id: str = Depends(get_current_user)):
    result = (
        supabase.table("houses").select("*").eq("id", house_id).execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="House not found")

    house = result.data[0]
    return {**house, "members": _get_members(house_id)}
