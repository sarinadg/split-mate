from typing import List
from fastapi import APIRouter, Depends
from backend.auth import get_current_user
from backend.database import supabase
from backend.models import SettlementCreate, SettlementResponse

router = APIRouter(prefix="/settlements", tags=["settlements"])


@router.post("", response_model=SettlementResponse)
def add_settlement(body: SettlementCreate, user_id: str = Depends(get_current_user)):
    result = (
        supabase.table("settlements")
        .insert({
            "house_id": body.house_id,
            "from_id": body.from_id,
            "to_id": body.to_id,
            "amount": body.amount,
        })
        .execute()
    )
    return result.data[0]


@router.get("", response_model=List[SettlementResponse])
def list_settlements(house_id: str, user_id: str = Depends(get_current_user)):
    result = (
        supabase.table("settlements")
        .select("*")
        .eq("house_id", house_id)
        .order("date", desc=True)
        .execute()
    )
    return result.data
