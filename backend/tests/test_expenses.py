from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from backend.main import app
from backend.auth import get_current_user

app.dependency_overrides[get_current_user] = lambda: "test-user-id"
client = TestClient(app)

VALID_EXPENSE = {
    "house_id": "house-1",
    "name": "Electricity",
    "amount": 120.0,
    "category": "Utilities",
    "paid_by_id": "test-user-id",
    "split_between": ["test-user-id", "other-user-id"],
    "date": "2026-05-22T00:00:00Z",
}

MOCK_EXPENSE_ROW = {
    "id": "exp-1",
    "house_id": "house-1",
    "name": "Electricity",
    "amount": 120.0,
    "category": "Utilities",
    "paid_by_id": "test-user-id",
    "split_between": ["test-user-id", "other-user-id"],
    "date": "2026-05-22T00:00:00Z",
}


def test_add_expense_validates_input():
    res = client.post("/expenses", json={"name": "Missing fields"})
    assert res.status_code == 422


def test_list_expenses_requires_house_id():
    res = client.get("/expenses")
    assert res.status_code == 422


def test_list_expenses_returns_list():
    with patch("backend.routers.expenses.supabase") as mock_db:
        chain = MagicMock()
        chain.select.return_value = chain
        chain.eq.return_value = chain
        chain.order.return_value = chain
        chain.execute.return_value.data = []
        mock_db.table.return_value = chain

        res = client.get("/expenses?house_id=house-1")
        assert res.status_code == 200
        assert isinstance(res.json(), list)


def test_add_expense_success():
    with patch("backend.routers.expenses.supabase") as mock_db:
        chain = MagicMock()
        chain.insert.return_value = chain
        chain.execute.return_value.data = [MOCK_EXPENSE_ROW]
        mock_db.table.return_value = chain

        res = client.post("/expenses", json=VALID_EXPENSE)
        assert res.status_code == 200
        assert res.json()["name"] == "Electricity"
        assert res.json()["amount"] == 120.0


def _chain(data):
    m = MagicMock()
    m.select.return_value = m
    m.delete.return_value = m
    m.eq.return_value = m
    m.execute.return_value.data = data
    return m


def test_delete_expense_not_found():
    with patch("backend.routers.expenses.supabase") as mock_db:
        mock_db.table.return_value = _chain([])
        res = client.delete("/expenses/exp-missing")
        assert res.status_code == 404


def test_delete_expense_forbidden():
    with patch("backend.routers.expenses.supabase") as mock_db:
        mock_db.table.side_effect = [
            _chain([{"house_id": "house-1"}]),  # expense lookup
            _chain([]),                          # membership check → not a member
        ]
        res = client.delete("/expenses/exp-1")
        assert res.status_code == 403


def test_delete_expense_success():
    with patch("backend.routers.expenses.supabase") as mock_db:
        mock_db.table.side_effect = [
            _chain([{"house_id": "house-1"}]),          # expense lookup
            _chain([{"user_id": "test-user-id"}]),      # membership check
            _chain([]),                                  # delete
        ]
        res = client.delete("/expenses/exp-1")
        assert res.status_code == 204
