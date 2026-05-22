from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from backend.main import app
from backend.auth import get_current_user

TEST_USER_ID = "test-user-uuid-abc123"


def override_auth():
    return TEST_USER_ID


app.dependency_overrides[get_current_user] = override_auth
client = TestClient(app)


def _make_chain(*execute_results):
    """
    Build a supabase fluent-chain mock.
    execute_results: sequence of lists to return from consecutive .execute() calls.
    """
    chain = MagicMock()
    chain.select.return_value = chain
    chain.insert.return_value = chain
    chain.upsert.return_value = chain
    chain.eq.return_value = chain
    chain.in_.return_value = chain
    chain.execute.side_effect = [MagicMock(data=d) for d in execute_results]
    return chain


def test_create_user_profile():
    with patch("backend.routers.users.supabase") as mock_db:
        user_data = {
            "id": TEST_USER_ID, "name": "Test User",
            "initials": "TU", "color": "red", "handle": "@test",
        }
        # upsert, then select user, then get house_id (none)
        chain = _make_chain([user_data], [user_data], [])
        mock_db.table.return_value = chain

        res = client.post("/users/me", json={
            "name": "Test User", "initials": "TU",
            "color": "red", "handle": "@test",
        })
        assert res.status_code == 200
        assert res.json()["name"] == "Test User"
        assert res.json()["house_id"] is None


def test_create_user_requires_name():
    res = client.post("/users/me", json={"initials": "TU", "color": "red", "handle": "@test"})
    assert res.status_code == 422


def test_get_user_not_found():
    with patch("backend.routers.users.supabase") as mock_db:
        # select returns nothing → 404
        chain = _make_chain([])
        mock_db.table.return_value = chain

        res = client.get("/users/me")
        assert res.status_code == 404


def test_get_user_success():
    with patch("backend.routers.users.supabase") as mock_db:
        user_data = {
            "id": TEST_USER_ID, "name": "Test User",
            "initials": "TU", "color": "red", "handle": "@test",
        }
        # select user, then get house_id
        chain = _make_chain([user_data], [{"house_id": "house-1"}])
        mock_db.table.return_value = chain

        res = client.get("/users/me")
        assert res.status_code == 200
        assert res.json()["house_id"] == "house-1"


def test_get_user_requires_auth():
    app.dependency_overrides.pop(get_current_user, None)
    unauth_client = TestClient(app)
    res = unauth_client.get("/users/me")
    assert res.status_code == 403
    app.dependency_overrides[get_current_user] = override_auth
