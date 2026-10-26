import sys
import os
import uuid
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.db.database import SessionLocal
from app.models.auth import User, Role
from app.models.profile import CitizenProfile

client = TestClient(app)

@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()

def test_1_farmer_registration_persists_citizen_role_and_farmer_persona():
    unique = uuid.uuid4().hex[:6]
    email = f"farmer_{unique}@test.com"
    pwd = "FarmerPassword123!"

    # Register as farmer
    res = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": pwd,
        "persona": "farmer",
        "full_name": f"Test Farmer {unique}"
    })
    assert res.status_code == 200, f"Registration failed: {res.text}"
    data = res.json()["data"]
    
    # Must be Citizen role (4), NEVER administrative role (1 or 2)
    assert data["role_id"] == 4, f"Expected role_id=4, got {data['role_id']}"
    assert data["persona"] == "farmer", f"Expected persona='farmer', got {data['persona']}"
    assert data["role_name"] == "Citizen"

    # Login and check /auth/me
    login_res = client.post("/api/v1/auth/login", data={"username": email, "password": pwd})
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]

    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()["data"]
    assert me_data["role_id"] == 4
    assert me_data["persona"] == "farmer"

def test_2_student_registration_persists_citizen_role_and_student_persona():
    unique = uuid.uuid4().hex[:6]
    email = f"student_{unique}@test.com"
    pwd = "StudentPassword123!"

    res = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": pwd,
        "persona": "student",
        "full_name": f"Test Student {unique}"
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["role_id"] == 4
    assert data["persona"] == "student"

    # Login
    login_res = client.post("/api/v1/auth/login", data={"username": email, "password": pwd})
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]

    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()["data"]
    assert me_data["role_id"] == 4
    assert me_data["persona"] == "student"

def test_3_citizen_registration_persists_citizen_role_and_citizen_persona():
    unique = uuid.uuid4().hex[:6]
    email = f"citizen_{unique}@test.com"
    pwd = "CitizenPassword123!"

    res = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": pwd,
        "persona": "citizen",
        "full_name": f"Test Citizen {unique}"
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["role_id"] == 4
    assert data["persona"] == "citizen"

    # Login
    login_res = client.post("/api/v1/auth/login", data={"username": email, "password": pwd})
    assert login_res.status_code == 200
    token = login_res.json()["data"]["access_token"]

    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()["data"]
    assert me_data["role_id"] == 4
    assert me_data["persona"] == "citizen"

def test_4_registration_cannot_escalate_privileges_to_admin_or_mandal_officer():
    # Attempting to supply role_id=1 (Super Admin) or role_id=2 (Mandal Admin) must be ignored or clamped to Citizen (4)
    unique = uuid.uuid4().hex[:6]
    email = f"hacker_{unique}@test.com"
    pwd = "HackerPassword123!"

    res = client.post("/api/v1/auth/register", json={
        "email": email,
        "password": pwd,
        "role_id": 1, # Attempt privilege escalation
        "persona": "farmer"
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["role_id"] == 4, "Security violation: registration permitted assignment of role_id=1"

    # Verify again via /auth/me
    login_res = client.post("/api/v1/auth/login", data={"username": email, "password": pwd})
    token = login_res.json()["data"]["access_token"]
    me_res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.json()["data"]["role_id"] == 4

def test_5_farmer_and_student_cannot_access_admin_analytics_endpoints():
    unique = uuid.uuid4().hex[:6]
    farmer_email = f"farmer_sec_{unique}@test.com"
    client.post("/api/v1/auth/register", json={
        "email": farmer_email, "password": "Password123!", "persona": "farmer"
    })
    login_f = client.post("/api/v1/auth/login", data={"username": farmer_email, "password": "Password123!"})
    f_token = login_f.json()["data"]["access_token"]

    # Farmer attempts to access admin analytics
    res = client.get("/api/v1/analytics/dashboard", headers={"Authorization": f"Bearer {f_token}"})
    assert res.status_code == 403, f"Expected 403 Forbidden for Farmer accessing Admin endpoint, got {res.status_code}"

    # Student attempts to access admin analytics
    student_email = f"student_sec_{unique}@test.com"
    client.post("/api/v1/auth/register", json={
        "email": student_email, "password": "Password123!", "persona": "student"
    })
    login_s = client.post("/api/v1/auth/login", data={"username": student_email, "password": "Password123!"})
    s_token = login_s.json()["data"]["access_token"]

    res = client.get("/api/v1/analytics/dashboard", headers={"Authorization": f"Bearer {s_token}"})
    assert res.status_code == 403, f"Expected 403 Forbidden for Student accessing Admin endpoint, got {res.status_code}"

def test_6_super_admin_and_officer_roles_verified_correctly():
    # Login super admin
    login_adm = client.post("/api/v1/auth/login", data={"username": "demo.admin@gramai.gov.in", "password": "AdminPassword123!"})
    assert login_adm.status_code == 200
    adm_token = login_adm.json()["data"]["access_token"]
    me_adm = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {adm_token}"})
    assert me_adm.json()["data"]["role_id"] == 1
    assert me_adm.json()["data"]["role_name"] == "Super Admin"

    # Super admin can access admin dashboard
    res = client.get("/api/v1/analytics/dashboard", headers={"Authorization": f"Bearer {adm_token}"})
    assert res.status_code == 200

    # Login demo officer
    login_off = client.post("/api/v1/auth/login", data={"username": "demo.officer@gramai.gov.in", "password": "OfficerPassword123!"})
    assert login_off.status_code == 200
    off_token = login_off.json()["data"]["access_token"]
    me_off = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {off_token}"})
    assert me_off.json()["data"]["role_id"] in [2, 3]

def test_7_legacy_farmer_account_has_citizen_role_and_farmer_persona(db):
    f = db.query(User).filter(User.email == "farmer@gmail.com").first()
    if f:
        assert f.role_id == 4, f"Expected role_id=4 for farmer@gmail.com, got {f.role_id}"
        p = db.query(CitizenProfile).filter(CitizenProfile.user_id == f.id).first()
        assert p is not None
        assert p.occupation == "farmer"
