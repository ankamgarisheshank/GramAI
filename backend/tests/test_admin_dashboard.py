import sys
import os
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.db.database import get_db, SessionLocal
from app.models.auth import User, Role
from app.models.application import Application
from app.models.scheme import Scheme
from app.core.security import create_access_token

client = TestClient(app)

@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    yield db
    db.close()

@pytest.fixture(scope="module")
def test_users(db_session: Session):
    # Retrieve or create roles
    roles = {r.name: r for r in db_session.query(Role).all()}
    
    # 1. Super Admin
    admin = db_session.query(User).filter(User.role_id == roles["Super Admin"].id).first()
    if not admin:
        admin = User(id=uuid.uuid4(), email=f"admin_{uuid.uuid4().hex[:6]}@test.gov.in", hashed_password="x", role_id=roles["Super Admin"].id)
        db_session.add(admin)
        db_session.commit()
        db_session.refresh(admin)

    # 2. Village Admin / Officer
    officer = db_session.query(User).filter(User.role_id == roles["Village Admin"].id).first()
    if not officer:
        officer = User(id=uuid.uuid4(), email=f"officer_{uuid.uuid4().hex[:6]}@test.gov.in", hashed_password="x", role_id=roles["Village Admin"].id)
        db_session.add(officer)
        db_session.commit()
        db_session.refresh(officer)

    # 3. Citizen
    citizen = db_session.query(User).filter(User.role_id == roles["Citizen"].id).first()
    if not citizen:
        citizen = User(id=uuid.uuid4(), email=f"citizen_{uuid.uuid4().hex[:6]}@test.gov.in", hashed_password="x", role_id=roles["Citizen"].id)
        db_session.add(citizen)
        db_session.commit()
        db_session.refresh(citizen)

    admin_token = create_access_token(admin.id)
    officer_token = create_access_token(officer.id)
    citizen_token = create_access_token(citizen.id)

    return {
        "admin": admin,
        "officer": officer,
        "citizen": citizen,
        "admin_token": admin_token,
        "officer_token": officer_token,
        "citizen_token": citizen_token,
    }


def test_1_unauthenticated_cannot_access_dashboard_metrics():
    """Unauthenticated request to /analytics/dashboard must return 401."""
    response = client.get("/api/v1/analytics/dashboard")
    assert response.status_code == 401, f"Expected 401, got {response.status_code}"


def test_2_citizen_cannot_access_dashboard_metrics(test_users):
    """Citizen must be forbidden (403) from accessing admin metrics."""
    headers = {"Authorization": f"Bearer {test_users['citizen_token']}"}
    response = client.get("/api/v1/analytics/dashboard", headers=headers)
    assert response.status_code == 403, f"Expected 403 Forbidden for citizen, got {response.status_code}"


def test_3_authorized_admin_can_access_dashboard_metrics(test_users):
    """Super Admin must be able to retrieve dashboard metrics successfully."""
    headers = {"Authorization": f"Bearer {test_users['admin_token']}"}
    response = client.get("/api/v1/analytics/dashboard", headers=headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    body = response.json()
    assert body["success"] is True
    assert "data" in body
    data = body["data"]
    assert "total_applications" in data
    assert "submitted_applications" in data
    assert "under_review_applications" in data
    assert "approved_applications" in data
    assert "rejected_applications" in data
    assert "total_schemes" in data
    assert "total_citizens" in data
    assert "recent_applications" in data


def test_4_authorized_officer_can_access_dashboard_metrics(test_users):
    """Village Admin / Officer must be able to retrieve dashboard metrics."""
    headers = {"Authorization": f"Bearer {test_users['officer_token']}"}
    response = client.get("/api/v1/analytics/dashboard", headers=headers)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    assert response.json()["success"] is True


def test_5_metrics_match_actual_database_records(test_users, db_session: Session):
    """Reported dashboard metrics must match actual database records."""
    headers = {"Authorization": f"Bearer {test_users['admin_token']}"}
    response = client.get("/api/v1/analytics/dashboard", headers=headers)
    assert response.status_code == 200
    data = response.json()["data"]

    # Compare directly with database records
    expected_total_apps = db_session.query(Application).count()
    expected_submitted = db_session.query(Application).filter(Application.status.in_(["SUBMITTED", "Pending"])).count()
    expected_under_review = db_session.query(Application).filter(Application.status == "UNDER_REVIEW").count()
    expected_approved = db_session.query(Application).filter(Application.status == "APPROVED").count()
    expected_rejected = db_session.query(Application).filter(Application.status == "REJECTED").count()
    expected_drafts = db_session.query(Application).filter(Application.status == "DRAFT").count()

    expected_total_schemes = db_session.query(Scheme).filter(Scheme.is_deleted == False).count()
    expected_total_users = db_session.query(User).count()
    expected_citizens = db_session.query(User).filter(User.role_id == 4).count()

    assert data["total_applications"] == expected_total_apps
    assert data["submitted_applications"] == expected_submitted
    assert data["under_review_applications"] == expected_under_review
    assert data["approved_applications"] == expected_approved
    assert data["rejected_applications"] == expected_rejected
    assert data["draft_applications"] == expected_drafts
    assert data["total_schemes"] == expected_total_schemes
    assert data["total_users"] == expected_total_users
    assert data["total_citizens"] == expected_citizens


def test_6_recent_applications_contain_valid_structure(test_users):
    """Recent applications must contain real structured application data."""
    headers = {"Authorization": f"Bearer {test_users['admin_token']}"}
    response = client.get("/api/v1/analytics/dashboard", headers=headers)
    data = response.json()["data"]
    recent = data["recent_applications"]
    assert isinstance(recent, list)
    if len(recent) > 0:
        first = recent[0]
        assert "id" in first
        assert "application_id" in first
        assert "scheme_name" in first
        assert "applicant_name" in first
        assert "status" in first


def test_7_admin_applications_endpoint_role_security(test_users):
    """Citizen cannot access /admin/applications; Admin can."""
    # Citizen -> 403
    cit_resp = client.get("/api/v1/admin/applications", headers={"Authorization": f"Bearer {test_users['citizen_token']}"})
    assert cit_resp.status_code == 403

    # Admin -> 200
    adm_resp = client.get("/api/v1/admin/applications", headers={"Authorization": f"Bearer {test_users['admin_token']}"})
    assert adm_resp.status_code == 200
    assert adm_resp.json()["success"] is True
    assert isinstance(adm_resp.json()["data"], list)


def test_8_admin_citizens_directory_and_account_inspection(test_users):
    """Admin can query citizen personas directory and view detailed citizen account dossier."""
    # 1. Citizen cannot access /admin/citizens
    cit_resp = client.get("/api/v1/admin/citizens", headers={"Authorization": f"Bearer {test_users['citizen_token']}"})
    assert cit_resp.status_code == 403

    # 2. Admin can list citizens with persona filters
    adm_resp = client.get("/api/v1/admin/citizens", headers={"Authorization": f"Bearer {test_users['admin_token']}"})
    assert adm_resp.status_code == 200
    data = adm_resp.json()
    assert data["success"] is True
    assert isinstance(data["data"], list)
    if len(data["data"]) > 0:
        first = data["data"][0]
        assert "id" in first
        assert "persona" in first
        assert "application_count" in first

    # 3. Admin can inspect account dossier of citizen
    cit_id = str(test_users["citizen"].id)
    acc_resp = client.get(f"/api/v1/admin/users/{cit_id}/account", headers={"Authorization": f"Bearer {test_users['admin_token']}"})
    assert acc_resp.status_code == 200
    acc_data = acc_resp.json()
    assert acc_data["success"] is True
    assert "user" in acc_data["data"]
    assert acc_data["data"]["user"]["id"] == cit_id
    assert "applications" in acc_data["data"]
    assert isinstance(acc_data["data"]["applications"], list)

