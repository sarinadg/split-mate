from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from backend.main import app
from backend.auth import get_current_user

app.dependency_overrides[get_current_user] = lambda: "test-user-id"
client = TestClient(app)

MOCK_SETTLEMENT_ROW = {
    "id": "settle-1",
    "house_id": "house-1",
    "from_id": "test-user-id",
    "to_id": "other-user-id",
    "amount": 50.0,
    "date": "2026-05-22T00:00:00Z",
}


def test_add_settlement_validates_input():
    res = client.post("/settlements", json={"amount": 50.0})
    assert res.status_code == 422


def test_list_settlements_requires_house_id():
    res = client.get("/settlements")
    assert res.status_code == 422


def test_list_settlements_returns_list():
    with patch("backend.routers.settlements.supabase") as mock_db:
        chain = MagicMock()
        chain.select.return_value = chain
        chain.eq.return_value = chain
        chain.order.return_value = chain
        chain.execute.return_value.data = []
        mock_db.table.return_value = chain

        res = client.get("/settlements?house_id=house-1")
        assert res.status_code == 200
        assert isinstance(res.json(), list)


def test_add_settlement_success():
    with patch("backend.routers.settlements.supabase") as mock_db:
        chain = MagicMock()
        chain.insert.return_value = chain
        chain.execute.return_value.data = [MOCK_SETTLEMENT_ROW]
        mock_db.table.return_value = chain

        res = client.post("/settlements", json={
            "house_id": "house-1",
            "from_id": "test-user-id",
            "to_id": "other-user-id",
            "amount": 50.0,
        })
        assert res.status_code == 200
        assert res.json()["amount"] == 50.0
