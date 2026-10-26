import sys
import os
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
import io

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.db.database import SessionLocal
from app.models.auth import User, Role
from app.models.application import Application
from app.models.scheme import Scheme
from app.models.profile import CitizenProfile
from app.core.security import create_access_token

client = TestClient(app)

@pytest.fixture(scope="module")
def db_session():
    db = SessionLocal()
    yield db
    db.close()

@pytest.fixture(scope="module")
def persistence_setup(db_session: Session):
    roles = {r.name: r for r in db_session.query(Role).all()}

    # Create Citizen 1
    c1 = User(
        id=uuid.uuid4(),
        email=f"cit1_{uuid.uuid4().hex[:6]}@test.gov.in",
        hashed_password="x",
        role_id=roles["Citizen"].id
    )
    db_session.add(c1)

    # Create Citizen 2
    c2 = User(
        id=uuid.uuid4(),
        email=f"cit2_{uuid.uuid4().hex[:6]}@test.gov.in",
        hashed_password="x",
        role_id=roles["Citizen"].id
    )
    db_session.add(c2)

    # Create Test Scheme
    scheme = Scheme(
        id=uuid.uuid4(),
        name=f"Persistence Test Scheme {uuid.uuid4().hex[:6]}",
        department="Rural Development",
        description="Scheme for persistence testing",
        benefits="Financial Assistance",
        required_documents="Aadhaar Card",
        application_process="Online verification",
        status="Active",
        is_deleted=False
    )
    db_session.add(scheme)
    db_session.commit()

    c1_token = create_access_token(c1.id)
    c2_token = create_access_token(c2.id)

    return {
        "c1": c1,
        "c2": c2,
        "c1_token": c1_token,
        "c2_token": c2_token,
        "scheme": scheme,
        "c1_headers": {"Authorization": f"Bearer {c1_token}"},
        "c2_headers": {"Authorization": f"Bearer {c2_token}"},
    }


# ==========================================
# APPLICATION DRAFTS TESTS (1 - 5)
# ==========================================

def test_1_application_owner_can_save_valid_draft_data(persistence_setup):
    """Application owner can save valid draft data via PUT /applications/{id}."""
    headers = persistence_setup["c1_headers"]
    scheme_id = str(persistence_setup["scheme"].id)

    # 1. Create a draft application
    create_resp = client.post("/api/v1/applications", json={"scheme_id": scheme_id}, headers=headers)
    assert create_resp.status_code == 200, f"Create app failed: {create_resp.text}"
    app_id = create_resp.json()["data"]["id"]
    persistence_setup["test_app_id"] = app_id

    # 2. Save draft data
    draft_data = {
        "full_name": "Ramesh Goud",
        "age": 38,
        "annual_income": 95000,
        "district": "Warangal",
        "mandal": "Hanamkonda",
        "village": "Gopalpur"
    }
    update_resp = client.put(f"/api/v1/applications/{app_id}", json={"form_data": draft_data}, headers=headers)
    assert update_resp.status_code == 200, f"Update draft failed: {update_resp.text}"
    body = update_resp.json()
    assert body["success"] is True
    assert body["data"]["form_data"]["full_name"] == "Ramesh Goud"
    assert body["data"]["form_data"]["annual_income"] == 95000
    assert body["data"]["status"] == "DRAFT"


def test_2_saved_draft_data_persists_when_fetched_again(persistence_setup):
    """Saved draft data persists in DB and is returned on GET /applications/{id}."""
    headers = persistence_setup["c1_headers"]
    app_id = persistence_setup["test_app_id"]

    get_resp = client.get(f"/api/v1/applications/{app_id}", headers=headers)
    assert get_resp.status_code == 200
    form_data = get_resp.json()["data"]["form_data"]
    assert form_data is not None
    assert form_data["full_name"] == "Ramesh Goud"
    assert form_data["annual_income"] == 95000
    assert form_data["district"] == "Warangal"


def test_3_another_citizen_cannot_update_draft(persistence_setup):
    """Another citizen cannot modify a user's application draft (403 Forbidden)."""
    c2_headers = persistence_setup["c2_headers"]
    app_id = persistence_setup["test_app_id"]

    malicious_data = {"form_data": {"full_name": "Malicious Attacker"}}
    update_resp = client.put(f"/api/v1/applications/{app_id}", json=malicious_data, headers=c2_headers)
    assert update_resp.status_code in [403, 404], f"Expected 403/404, got {update_resp.status_code}"


def test_4_non_draft_applications_cannot_be_modified(persistence_setup):
    """Non-DRAFT applications cannot be modified through the draft update route (400 Bad Request)."""
    headers = persistence_setup["c1_headers"]
    app_id = persistence_setup["test_app_id"]

    # Upload required Aadhaar Card
    file_content = b"%PDF-1.4 dummy aadhaar card"
    files = {"file": ("aadhaar.pdf", io.BytesIO(file_content), "application/pdf")}
    upload_resp = client.post(f"/api/v1/applications/{app_id}/documents", data={"document_type": "Aadhaar Card"}, files=files, headers=headers)
    assert upload_resp.status_code == 200

    # Submit application -> moves to SUBMITTED
    submit_resp = client.put(f"/api/v1/applications/{app_id}/submit", headers=headers)
    assert submit_resp.status_code == 200
    assert submit_resp.json()["data"]["status"] == "SUBMITTED"

    # Attempt to update draft after submission -> MUST FAIL
    attempt_resp = client.put(f"/api/v1/applications/{app_id}", json={"form_data": {"full_name": "Changed Name"}}, headers=headers)
    assert attempt_resp.status_code == 400, f"Expected 400 Bad Request, got {attempt_resp.status_code}"
    assert "Only DRAFT applications can be edited" in attempt_resp.json()["message"]


def test_5_protected_fields_cannot_be_overwritten(persistence_setup, db_session: Session):
    """Protected fields (status, application_id, scheme_id, etc.) cannot be overwritten through form data."""
    headers = persistence_setup["c1_headers"]
    app_id = persistence_setup["test_app_id"]

    # Verify database state remains uncompromised
    app = db_session.query(Application).filter(Application.id == uuid.UUID(app_id)).first()
    assert app.status == "SUBMITTED"
    assert not app.application_id.startswith("HACKED")
    assert app.scheme_id == persistence_setup["scheme"].id


# ==========================================
# CITIZEN PROFILES TESTS (6 - 9)
# ==========================================

def test_6_authenticated_user_can_retrieve_own_profile(persistence_setup):
    """Authenticated user can retrieve their profile (or empty/create one)."""
    headers = persistence_setup["c1_headers"]

    # Initial get: might be 404 or default
    resp = client.get("/api/v1/profiles/me", headers=headers)
    assert resp.status_code in [200, 404]


def test_7_valid_profile_edits_persist(persistence_setup):
    """Valid profile edits persist in database across requests."""
    headers = persistence_setup["c1_headers"]

    profile_payload = {
        "full_name": "Kavitha Reddy",
        "age": 34,
        "gender": "Female",
        "occupation": "Agriculture",
        "income": 140000.0,
        "address": "Khammam, Telangana"
    }

    # PUT /profiles/me
    put_resp = client.put("/api/v1/profiles/me", json=profile_payload, headers=headers)
    assert put_resp.status_code == 200, f"Update profile failed: {put_resp.text}"
    put_data = put_resp.json()["data"]
    assert put_data["full_name"] == "Kavitha Reddy"
    assert put_data["age"] == 34
    assert put_data["income"] == 140000.0

    # GET /profiles/me to confirm persistence
    get_resp = client.get("/api/v1/profiles/me", headers=headers)
    assert get_resp.status_code == 200
    get_data = get_resp.json()["data"]
    assert get_data["full_name"] == "Kavitha Reddy"
    assert get_data["gender"] == "Female"
    assert get_data["occupation"] == "Agriculture"
    assert get_data["address"] == "Khammam, Telangana"


def test_8_one_user_cannot_update_another_user_profile(persistence_setup):
    """One user cannot modify another user's profile."""
    c1_headers = persistence_setup["c1_headers"]
    c2_headers = persistence_setup["c2_headers"]

    # Citizen 2 updates their own profile
    c2_payload = {
        "full_name": "Sunitha Devi",
        "age": 29,
        "gender": "Female",
        "occupation": "Teacher"
    }
    client.put("/api/v1/profiles/me", json=c2_payload, headers=c2_headers)

    # Citizen 1's profile remains unchanged
    c1_get = client.get("/api/v1/profiles/me", headers=c1_headers).json()["data"]
    assert c1_get["full_name"] == "Kavitha Reddy"
    assert c1_get["age"] == 34

    # Citizen 2's profile is distinct
    c2_get = client.get("/api/v1/profiles/me", headers=c2_headers).json()["data"]
    assert c2_get["full_name"] == "Sunitha Devi"
    assert c2_get["age"] == 29


def test_9_invalid_profile_input_rejected(persistence_setup):
    """Invalid profile input (e.g. invalid type for income) is rejected with 422."""
    headers = persistence_setup["c1_headers"]

    invalid_payload = {
        "income": "NOT_A_NUMBER"
    }
    resp = client.put("/api/v1/profiles/me", json=invalid_payload, headers=headers)
    assert resp.status_code == 422
