from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from backend.main import app
from backend.auth import get_current_user

app.dependency_overrides[get_current_user] = lambda: "user-a"
client = TestClient(app)

HOUSE_ID = "house-1"


def _chain(data):
    m = MagicMock()
    m.select.return_value = m
    m.eq.return_value = m
    m.execute.return_value.data = data
    return m


def test_balances_not_member():
    with patch("backend.routers.houses.supabase") as mock_db:
        mock_db.table.return_value = _chain([])
        res = client.get(f"/houses/{HOUSE_ID}/balances")
        assert res.status_code == 403


def test_balances_empty_no_expenses():
    with patch("backend.routers.houses.supabase") as mock_db:
        mock_db.table.side_effect = [
            _chain([{"user_id": "user-a"}]),             # membership check
            _chain([{"user_id": "user-a"}, {"user_id": "user-b"}]),  # all members
            _chain([]),                                   # expenses
            _chain([]),                                   # settlements
        ]
        res = client.get(f"/houses/{HOUSE_ID}/balances")
        assert res.status_code == 200
        body = res.json()
        assert body["house_id"] == HOUSE_ID
        assert isinstance(body["balances"], dict)


def test_balances_simple_expense():
    """user-a paid $100 split with user-b → user-b owes user-a $50"""
    expense = {
        "id": "exp-1",
        "house_id": HOUSE_ID,
        "paid_by_id": "user-a",
        "amount": 100.0,
        "split_between": ["user-a", "user-b"],
    }
    with patch("backend.routers.houses.supabase") as mock_db:
        mock_db.table.side_effect = [
            _chain([{"user_id": "user-a"}]),
            _chain([{"user_id": "user-a"}, {"user_id": "user-b"}]),
            _chain([expense]),
            _chain([]),
        ]
        res = client.get(f"/houses/{HOUSE_ID}/balances")
        assert res.status_code == 200
        body = res.json()
        # From user-a's perspective: user-b owes 50
        assert body["balances"]["user-a"]["user-b"] == 50.0
        # From user-b's perspective: user-b owes user-a 50 (negative)
        assert body["balances"]["user-b"]["user-a"] == -50.0


def test_balances_settlement_clears_debt():
    """user-a paid $100 split with user-b, then user-b settled $50 → net zero"""
    expense = {
        "id": "exp-1",
        "house_id": HOUSE_ID,
        "paid_by_id": "user-a",
        "amount": 100.0,
        "split_between": ["user-a", "user-b"],
    }
    settlement = {
        "id": "set-1",
        "house_id": HOUSE_ID,
        "from_id": "user-b",
        "to_id": "user-a",
        "amount": 50.0,
    }
    with patch("backend.routers.houses.supabase") as mock_db:
        mock_db.table.side_effect = [
            _chain([{"user_id": "user-a"}]),
            _chain([{"user_id": "user-a"}, {"user_id": "user-b"}]),
            _chain([expense]),
            _chain([settlement]),
        ]
        res = client.get(f"/houses/{HOUSE_ID}/balances")
        assert res.status_code == 200
        body = res.json()
        assert body["balances"]["user-a"]["user-b"] == 0.0
        assert body["balances"]["user-b"]["user-a"] == 0.0
