from pydantic import BaseModel
from typing import Optional, List


class UserCreate(BaseModel):
    name: str
    initials: str
    color: str
    handle: str


class UserResponse(BaseModel):
    id: str
    name: str
    initials: str
    color: str
    handle: str
    house_id: Optional[str] = None


class HouseCreate(BaseModel):
    name: str


class HouseJoin(BaseModel):
    code: str


class HouseResponse(BaseModel):
    id: str
    name: str
    code: str
    members: List[UserResponse]


class ExpenseCreate(BaseModel):
    house_id: str
    name: str
    amount: float
    category: str
    paid_by_id: str
    split_between: List[str]
    date: str


class ExpenseResponse(BaseModel):
    id: str
    house_id: str
    name: str
    amount: float
    category: str
    paid_by_id: str
    split_between: List[str]
    date: str


class SettlementCreate(BaseModel):
    house_id: str
    from_id: str
    to_id: str
    amount: float


class SettlementResponse(BaseModel):
    id: str
    house_id: str
    from_id: str
    to_id: str
    amount: float
    date: str
