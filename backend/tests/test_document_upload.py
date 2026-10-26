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
from app.core.security import create_access_token
from app.services.document_service import STORAGE_DIR

client = TestClient(app)

@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()

@pytest.fixture(scope="module")
def test_setup(db):
    # Setup users, scheme, and application
    user1_id = uuid.uuid4()
    user1 = User(id=user1_id, email=f"user1_{user1_id}@test.com", hashed_password="pw", role_id=1)
    
    user2_id = uuid.uuid4()
    user2 = User(id=user2_id, email=f"user2_{user2_id}@test.com", hashed_password="pw", role_id=1)
    
    scheme_id = uuid.uuid4()
    scheme = Scheme(id=scheme_id, name="Test Scheme for Docs", department="Test", description="Test", benefits="Test", required_documents="Test", application_process="Test")
    
    db.add_all([user1, user2, scheme])
    db.commit()
    
    app1_id = uuid.uuid4()
    application1 = Application(
        id=app1_id, 
        user_id=user1_id, 
        scheme_id=scheme_id, 
        application_id=f"APP-{app1_id.hex[:6]}",
        status="DRAFT"
    )
    
    app2_id = uuid.uuid4()
    application2 = Application(
        id=app2_id, 
        user_id=user2_id, 
        scheme_id=scheme_id, 
        application_id=f"APP-{app2_id.hex[:6]}",
        status="SUBMITTED" # testing deletion prevention later maybe
    )
    
    db.add_all([application1, application2])
    db.commit()
    
    token1 = create_access_token(subject=user1_id)
    token2 = create_access_token(subject=user2_id)
    
    yield {
        "user1_id": user1_id,
        "token1": token1,
        "app1_id": app1_id,
        "user2_id": user2_id,
        "token2": token2,
        "app2_id": app2_id
    }
    
    # Cleanup
    db.query(Document).filter(Document.application_id.in_([app1_id, app2_id])).delete(synchronize_session=False)
    db.query(Application).filter(Application.id.in_([app1_id, app2_id])).delete(synchronize_session=False)
    db.delete(scheme)
    db.delete(user1)
    db.delete(user2)
    db.commit()

def test_upload_pdf_successfully(test_setup):
    token = test_setup["token1"]
    app_id = test_setup["app1_id"]
    
    # Create a dummy PDF file in memory
    files = {'file': ('test.pdf', b'%PDF-1.4 dummy content', 'application/pdf')}
    data = {'document_type': 'Aadhaar Card'}
    
    response = client.post(
        f"/api/v1/applications/{app_id}/documents",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
        data=data
    )
    
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["original_filename"] == "test.pdf"
    assert res_data["document_type"] == "Aadhaar Card"
    
    # Verify file exists
    filepath = os.path.join(STORAGE_DIR, res_data["stored_filename"])
    assert os.path.exists(filepath)
    
    # Clean up the physical file for this test
    # (Though we can leave it for the get/delete tests)

def test_upload_png_successfully(test_setup):
    token = test_setup["token1"]
    app_id = test_setup["app1_id"]
    
    files = {'file': ('image.png', b'\x89PNG\r\n\x1a\n...', 'image/png')}
    data = {'document_type': 'Income Certificate'}
    
    response = client.post(
        f"/api/v1/applications/{app_id}/documents",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
        data=data
    )
    assert response.status_code == 200

def test_reject_unsupported_extension(test_setup):
    token = test_setup["token1"]
    app_id = test_setup["app1_id"]
    
    files = {'file': ('malicious.exe', b'MZ...', 'application/x-msdownload')}
    data = {'document_type': 'Other'}
    
    response = client.post(
        f"/api/v1/applications/{app_id}/documents",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
        data=data
    )
    assert response.status_code == 400
    assert "Unsupported" in response.json()["message"]

def test_reject_oversized_file(test_setup):
    token = test_setup["token1"]
    app_id = test_setup["app1_id"]
    
    # Create a large dummy file > 10MB
    large_content = b'0' * (11 * 1024 * 1024)
    files = {'file': ('large.pdf', large_content, 'application/pdf')}
    data = {'document_type': 'Large Doc'}
    
    response = client.post(
        f"/api/v1/applications/{app_id}/documents",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
        data=data
    )
    assert response.status_code == 400
    assert "size" in response.json()["message"].lower()

def test_citizen_cannot_access_another_application(test_setup):
    # User 1 tries to upload to App 2 (belongs to User 2)
    token = test_setup["token1"]
    app_id2 = test_setup["app2_id"]
    
    files = {'file': ('test.pdf', b'%PDF-1.4 dummy content', 'application/pdf')}
    data = {'document_type': 'Aadhaar Card'}
    
    response = client.post(
        f"/api/v1/applications/{app_id2}/documents",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
        data=data
    )
    assert response.status_code == 404
    
    # Try viewing
    response2 = client.get(
        f"/api/v1/applications/{app_id2}/documents",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response2.status_code == 404

def test_list_documents(test_setup):
    token = test_setup["token1"]
    app_id = test_setup["app1_id"]
    
    response = client.get(
        f"/api/v1/applications/{app_id}/documents",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) >= 2 # We uploaded a PDF and a PNG earlier

def test_download_and_delete_document(test_setup):
    token = test_setup["token1"]
    app_id = test_setup["app1_id"]
    
    # Get document list
    list_res = client.get(
        f"/api/v1/applications/{app_id}/documents",
        headers={"Authorization": f"Bearer {token}"}
    )
    docs = list_res.json()
    doc_id = docs[0]["id"]
    stored_filename = docs[0]["stored_filename"]
    
    # 7. Download view
    download_res = client.get(
        f"/api/v1/applications/{app_id}/documents/{doc_id}/file",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert download_res.status_code == 200
    assert download_res.content is not None
    
    # 8, 10. Delete document and verify physical removal
    filepath = os.path.join(STORAGE_DIR, stored_filename)
    assert os.path.exists(filepath)
    
    del_res = client.delete(
        f"/api/v1/applications/{app_id}/documents/{doc_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert del_res.status_code == 200
    
    assert not os.path.exists(filepath)

def test_prevent_deletion_if_under_review(test_setup, db):
    token = test_setup["token2"]
    app_id = test_setup["app2_id"] # Status is SUBMITTED
    
    # Upload one
    files = {'file': ('test.pdf', b'%PDF-1.4 dummy content', 'application/pdf')}
    data = {'document_type': 'Aadhaar Card'}
    
    up_res = client.post(
        f"/api/v1/applications/{app_id}/documents",
        headers={"Authorization": f"Bearer {token}"},
        files=files,
        data=data
    )
    assert up_res.status_code == 200
    doc_id = up_res.json()["id"]
    
    # Change status to UNDER_REVIEW directly in DB
    app = db.query(Application).filter(Application.id == app_id).first()
    app.status = "UNDER_REVIEW"
    db.commit()
    
    # Try to delete
    del_res = client.delete(
        f"/api/v1/applications/{app_id}/documents/{doc_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert del_res.status_code == 403
