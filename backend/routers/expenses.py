from typing import List
from fastapi import APIRouter, Depends
from backend.auth import get_current_user
from backend.database import supabase
from backend.models import ExpenseCreate, ExpenseResponse

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("", response_model=ExpenseResponse)
def add_expense(body: ExpenseCreate, user_id: str = Depends(get_current_user)):
    result = (
        supabase.table("expenses")
        .insert({
            "house_id": body.house_id,
            "name": body.name,
            "amount": body.amount,
            "category": body.category,
            "paid_by_id": body.paid_by_id,
            "split_between": body.split_between,
            "date": body.date,
        })
        .execute()
    )
    return result.data[0]


@router.get("", response_model=List[ExpenseResponse])
def list_expenses(house_id: str, user_id: str = Depends(get_current_user)):
    result = (
        supabase.table("expenses")
        .select("*")
        .eq("house_id", house_id)
        .order("date", desc=True)
        .execute()
    )
    return result.data
