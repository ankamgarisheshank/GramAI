import sys
import os
import uuid
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.db.database import SessionLocal
from app.models.auth import User, Role
from app.models.analytics import AnalyticsEvent
from app.core.security import create_access_token

client = TestClient(app)

@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()

def test_1_anonymous_event_ingestion():
    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    res = client.post("/api/v1/analytics/events", json={
        "event_type": "page_view",
        "route": "/schemes",
        "session_id": session_id,
        "label": "Schemes Directory"
    })
    assert res.status_code == 200, res.text
    data = res.json()["data"]
    assert data["event_type"] == "page_view"
    assert "id" in data

def test_2_scheme_detail_and_apply_click_tracking():
    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    scheme_id = "1"
    
    # Track scheme detail view
    res1 = client.post("/api/v1/analytics/events", json={
        "event_type": "scheme_detail_view",
        "route": "/schemes/1",
        "scheme_id": scheme_id,
        "session_id": session_id
    })
    assert res1.status_code == 200

    # Track apply button click
    res2 = client.post("/api/v1/analytics/events", json={
        "event_type": "apply_button_click",
        "route": "/schemes/1",
        "scheme_id": scheme_id,
        "session_id": session_id
    })
    assert res2.status_code == 200

    # Track external link click
    res3 = client.post("/api/v1/analytics/events", json={
        "event_type": "external_link_click",
        "route": "/schemes/1",
        "scheme_id": scheme_id,
        "session_id": session_id,
        "label": "http://rythubandhu.telangana.gov.in/"
    })
    assert res3.status_code == 200

def test_3_invalid_event_type_rejected():
    res = client.post("/api/v1/analytics/events", json={
        "event_type": "malicious_exploit_or_random",
        "route": "/dashboard"
    })
    assert res.status_code == 422

def test_4_admin_dashboard_metrics_includes_personas_and_events():
    # Login as Super Admin
    login_adm = client.post("/api/v1/auth/login", data={
        "username": "demo.admin@gramai.gov.in", 
        "password": "AdminPassword123!"
    })
    assert login_adm.status_code == 200
    token = login_adm.json()["data"]["access_token"]

    res = client.get("/api/v1/analytics/dashboard", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = res.json()["data"]

    # Verify persona accounts are present
    assert "farmer_accounts" in data
    assert "student_accounts" in data
    assert "senior_accounts" in data
    assert "general_citizen_accounts" in data

    # Verify user activity metrics
    assert "registrations_today" in data
    assert "active_users_24h" in data

    # Verify scheme engagement metrics
    assert "total_page_views" in data
    assert "unique_sessions" in data
    assert "scheme_detail_views" in data
    assert "apply_clicks" in data
    assert "external_link_clicks" in data
    assert "top_viewed_schemes" in data

def test_5_citizen_forbidden_from_admin_analytics():
    # Login as citizen
    login_cit = client.post("/api/v1/auth/login", data={
        "username": "citizen_verify_audit@test.com",
        "password": "CitizenPassword123!"
    })
    if login_cit.status_code == 200:
        token = login_cit.json()["data"]["access_token"]
        res = client.get("/api/v1/analytics/dashboard", headers={"Authorization": f"Bearer {token}"})
        assert res.status_code == 403
