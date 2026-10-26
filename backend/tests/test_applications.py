import sys
import os
import uuid
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.db.session import SessionLocal
from app.models.auth import User
from app.models.scheme import Scheme
from app.models.application import Application
from app.models.document import Document
from app.models.profile import CitizenProfile
from app.core.security import create_access_token

client = TestClient(app)

@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()

@pytest.fixture(scope="module")
def app_test_setup(db):
    user1_id = uuid.uuid4()
    user1 = User(id=user1_id, email=f"userapp1_{user1_id}@test.com", hashed_password="pw", role_id=1)
    
    user2_id = uuid.uuid4()
    user2 = User(id=user2_id, email=f"userapp2_{user2_id}@test.com", hashed_password="pw", role_id=1)
    
    # Adding a profile for user1 to test eligibility
    profile = CitizenProfile(
        id=uuid.uuid4(),
        user_id=user1_id,
        full_name="Ravi Kumar",
        age=40,
        income=150000.0,
        occupation="Farmer"
    )

    scheme_id = uuid.uuid4()
    scheme = Scheme(
        id=scheme_id, 
        name="Test Scheme for Apps", 
        department="Test", 
        description="Test", 
        benefits="Test", 
        required_documents="Aadhaar Card, Income Certificate", 
        application_process="Test",
        status="Active",
        age_limit_min=18,
        age_limit_max=60,
        income_limit=200000.0,
        beneficiary_type="Farmer"
    )
    
    inactive_scheme_id = uuid.uuid4()
    inactive_scheme = Scheme(
        id=inactive_scheme_id, 
        name="Inactive Scheme", 
        department="Test", 
        description="Test", 
        benefits="Test", 
        required_documents="", 
        application_process="Test",
        status="Inactive"
    )

    db.add_all([user1, user2, profile, scheme, inactive_scheme])
    db.commit()
    
    token1 = create_access_token(subject=user1_id)
    token2 = create_access_token(subject=user2_id)
    
    yield {
        "user1_id": user1_id,
        "token1": token1,
        "user2_id": user2_id,
        "token2": token2,
        "scheme_id": scheme_id,
        "inactive_scheme_id": inactive_scheme_id
    }
    
    # Cleanup
    db.query(Document).filter(Document.application_id.in_(
        db.query(Application.id).filter(Application.scheme_id.in_([scheme_id, inactive_scheme_id]))
    )).delete(synchronize_session=False)
    db.query(Application).filter(Application.scheme_id.in_([scheme_id, inactive_scheme_id])).delete(synchronize_session=False)
    db.delete(inactive_scheme)
    db.delete(scheme)
    db.delete(profile)
    db.delete(user1)
    db.delete(user2)
    db.commit()


def test_create_application(app_test_setup):
    token = app_test_setup["token1"]
    scheme_id = str(app_test_setup["scheme_id"])
    
    payload = {
        "scheme_id": scheme_id,
        "form_data": {
            "land_area": 2.5
        }
    }
    
    response = client.post(
        "/api/v1/applications",
        headers={"Authorization": f"Bearer {token}"},
        json=payload
    )
    
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["scheme_id"] == scheme_id
    assert data["status"] == "DRAFT"
    assert data["application_id"].startswith("GRM-")
    
    # Check that we can fetch detail and see form data & eligibility
    app_id = data["id"]
    res2 = client.get(
        f"/api/v1/applications/{app_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert res2.status_code == 200
    detail = res2.json()["data"]
    assert detail["form_data"]["land_area"] == 2.5
    assert detail["eligibility_result"]["eligible"] is True
    assert "Age requirement satisfied" in str(detail["eligibility_result"]["reasons"])
    
    # Store app_id for next tests
    pytest.shared_app_id = app_id

def test_duplicate_active_application_rejected(app_test_setup):
    token = app_test_setup["token1"]
    scheme_id = str(app_test_setup["scheme_id"])
    
    payload = {
        "scheme_id": scheme_id,
        "form_data": {}
    }
    
    response = client.post(
        "/api/v1/applications",
        headers={"Authorization": f"Bearer {token}"},
        json=payload
    )
    
    assert response.status_code == 409
    assert "already have an active application" in response.json()["message"].lower()

def test_cannot_apply_inactive_scheme(app_test_setup):
    token = app_test_setup["token1"]
    scheme_id = str(app_test_setup["inactive_scheme_id"])
    
    payload = {
        "scheme_id": scheme_id,
        "form_data": {}
    }
    
    response = client.post(
        "/api/v1/applications",
        headers={"Authorization": f"Bearer {token}"},
        json=payload
    )
    
    assert response.status_code == 400
    assert "inactive" in response.json()["message"].lower()

def test_submission_fails_missing_documents(app_test_setup):
    token = app_test_setup["token1"]
    app_id = pytest.shared_app_id
    
    response = client.put(
        f"/api/v1/applications/{app_id}/submit",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 400
    assert "Required documents are missing" in response.json()["message"]
    # Expecting Income Certificate and Aadhaar Card to be missing
    assert "missing_documents" in response.json()
    assert len(response.json()["missing_documents"]) == 2

def test_submission_success(app_test_setup):
    token = app_test_setup["token1"]
    app_id = pytest.shared_app_id
    
    # Upload required documents
    files = {'file': ('test.pdf', b'%PDF-1.4 dummy content', 'application/pdf')}
    data = {'document_type': 'Aadhaar Card'}
    client.post(f"/api/v1/applications/{app_id}/documents", headers={"Authorization": f"Bearer {token}"}, files=files, data=data)

    files2 = {'file': ('test2.pdf', b'%PDF-1.4 dummy content2', 'application/pdf')}
    data2 = {'document_type': 'Income Certificate'}
    client.post(f"/api/v1/applications/{app_id}/documents", headers={"Authorization": f"Bearer {token}"}, files=files2, data=data2)
    
    # Now submit
    response = client.put(
        f"/api/v1/applications/{app_id}/submit",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "SUBMITTED"
    assert response.json()["data"]["submitted_at"] is not None

def test_cannot_submit_already_submitted(app_test_setup):
    token = app_test_setup["token1"]
    app_id = pytest.shared_app_id
    
    response = client.put(
        f"/api/v1/applications/{app_id}/submit",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 400
    assert "cannot be submitted from status: SUBMITTED" in response.json()["message"]

def test_citizen_cannot_access_another_users_application(app_test_setup):
    token2 = app_test_setup["token2"]
    app_id = pytest.shared_app_id
    
    response = client.get(
        f"/api/v1/applications/{app_id}",
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert response.status_code == 404
    
    response2 = client.put(
        f"/api/v1/applications/{app_id}/submit",
        headers={"Authorization": f"Bearer {token2}"}
    )
    assert response2.status_code == 404

def test_list_my_applications(app_test_setup):
    token = app_test_setup["token1"]
    
    response = client.get(
        "/api/v1/applications/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 1
    assert data[0]["scheme_id"] == str(app_test_setup["scheme_id"])
