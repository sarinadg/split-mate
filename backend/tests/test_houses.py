from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from backend.main import app
from backend.auth import get_current_user

TEST_USER_ID = "test-user-uuid-abc123"

app.dependency_overrides[get_current_user] = lambda: TEST_USER_ID
client = TestClient(app)

MOCK_HOUSE = {"id": "house-1", "name": "Test House", "code": "ABC123"}


def _make_chain(*execute_results):
    chain = MagicMock()
    chain.select.return_value = chain
    chain.insert.return_value = chain
    chain.upsert.return_value = chain
    chain.eq.return_value = chain
    chain.in_.return_value = chain
    chain.execute.side_effect = [MagicMock(data=d) for d in execute_results]
    return chain


def test_create_house_validates_name():
    res = client.post("/houses", json={})
    assert res.status_code == 422


def test_join_house_validates_code():
    res = client.post("/houses/join", json={})
    assert res.status_code == 422


def test_get_house_not_found():
    with patch("backend.routers.houses.supabase") as mock_db:
        chain = _make_chain([])
        mock_db.table.return_value = chain
        res = client.get("/houses/nonexistent-id")
        assert res.status_code == 404


def test_join_house_invalid_code():
    with patch("backend.routers.houses.supabase") as mock_db:
        chain = _make_chain([])
        mock_db.table.return_value = chain
        res = client.post("/houses/join", json={"code": "BADCODE"})
        assert res.status_code == 404


def test_create_house_success():
    with patch("backend.routers.houses.supabase") as mock_db:
        # check existing membership → none
        # insert house → returns house
        # insert member → ok
        # get house_members → none (for _get_members)
        chain = _make_chain([], [MOCK_HOUSE], [{}], [], [])
        mock_db.table.return_value = chain
        res = client.post("/houses", json={"name": "Test House"})
        assert res.status_code == 200
        assert res.json()["name"] == "Test House"
        assert res.json()["code"] == "ABC123"


def test_join_house_success():
    with patch("backend.routers.houses.supabase") as mock_db:
        # lookup by code → found
        # check already member → not yet
        # insert member → ok
        # get house_members → none
        chain = _make_chain([MOCK_HOUSE], [], [{}], [], [])
        mock_db.table.return_value = chain
        res = client.post("/houses/join", json={"code": "ABC123"})
        assert res.status_code == 200
        assert res.json()["id"] == "house-1"


def _chain(data):
    m = MagicMock()
    m.select.return_value = m
    m.delete.return_value = m
    m.eq.return_value = m
    m.execute.return_value.data = data
    return m


def test_leave_house_not_member():
    with patch("backend.routers.houses.supabase") as mock_db:
        mock_db.table.return_value = _chain([])
        res = client.delete("/houses/house-1/leave")
        assert res.status_code == 404


def test_leave_house_success():
    with patch("backend.routers.houses.supabase") as mock_db:
        mock_db.table.side_effect = [
            _chain([{"user_id": TEST_USER_ID}]),  # membership check
            _chain([]),                            # delete member
            _chain([{"user_id": "other-user"}]),  # remaining members (house survives)
        ]
        res = client.delete("/houses/house-1/leave")
        assert res.status_code == 204


def test_leave_house_last_member_deletes_house():
    with patch("backend.routers.houses.supabase") as mock_db:
        mock_db.table.side_effect = [
            _chain([{"user_id": TEST_USER_ID}]),  # membership check
            _chain([]),                            # delete member
            _chain([]),                            # no remaining members → house deleted
            _chain([]),                            # delete house
        ]
        res = client.delete("/houses/house-1/leave")
        assert res.status_code == 204
