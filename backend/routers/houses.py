import random
import string
from fastapi import APIRouter, Depends, HTTPException
from backend.auth import get_current_user
from backend.database import supabase
from backend.models import HouseCreate, HouseJoin, HouseResponse, HouseBalancesResponse, UserResponse

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


@router.get("/{house_id}/balances", response_model=HouseBalancesResponse)
def get_house_balances(house_id: str, user_id: str = Depends(get_current_user)):
    membership = (
        supabase.table("house_members")
        .select("user_id")
        .eq("house_id", house_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not membership.data:
        raise HTTPException(status_code=403, detail="Not a member of this house")

    all_members = (
        supabase.table("house_members")
        .select("user_id")
        .eq("house_id", house_id)
        .execute()
    )
    member_ids = [m["user_id"] for m in all_members.data]

    expenses = supabase.table("expenses").select("*").eq("house_id", house_id).execute().data
    settlements = supabase.table("settlements").select("*").eq("house_id", house_id).execute().data

    # balances[A][B] > 0 → B owes A; < 0 → A owes B
    balances: dict[str, dict[str, float]] = {mid: {} for mid in member_ids}

    for expense in expenses:
        paid_by = expense["paid_by_id"]
        split_between = expense["split_between"] or []
        if not split_between:
            continue
        share = expense["amount"] / len(split_between)
        for member in split_between:
            if member == paid_by:
                continue
            if paid_by in balances:
                balances[paid_by][member] = round(balances[paid_by].get(member, 0) + share, 2)
            if member in balances:
                balances[member][paid_by] = round(balances[member].get(paid_by, 0) - share, 2)

    for s in settlements:
        from_id, to_id, amount = s["from_id"], s["to_id"], s["amount"]
        # from_id paid to_id, paying off debt
        if to_id in balances:
            balances[to_id][from_id] = round(balances[to_id].get(from_id, 0) - amount, 2)
        if from_id in balances:
            balances[from_id][to_id] = round(balances[from_id].get(to_id, 0) + amount, 2)

    return {"house_id": house_id, "balances": balances}


@router.delete("/{house_id}/leave", status_code=204)
def leave_house(house_id: str, user_id: str = Depends(get_current_user)):
    membership = (
        supabase.table("house_members")
        .select("user_id")
        .eq("house_id", house_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not membership.data:
        raise HTTPException(status_code=404, detail="Not a member of this house")

    supabase.table("house_members").delete().eq("house_id", house_id).eq("user_id", user_id).execute()

    remaining = (
        supabase.table("house_members")
        .select("user_id")
        .eq("house_id", house_id)
        .execute()
    )
    if not remaining.data:
        supabase.table("houses").delete().eq("id", house_id).execute()
