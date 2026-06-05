from typing import List
from fastapi import APIRouter, Depends, HTTPException
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


@router.delete("/{expense_id}", status_code=204)
def delete_expense(expense_id: str, user_id: str = Depends(get_current_user)):
    result = supabase.table("expenses").select("house_id").eq("id", expense_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Expense not found")

    house_id = result.data[0]["house_id"]
    membership = (
        supabase.table("house_members")
        .select("user_id")
        .eq("house_id", house_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not membership.data:
        raise HTTPException(status_code=403, detail="Not a member of this house")

    supabase.table("expenses").delete().eq("id", expense_id).execute()
