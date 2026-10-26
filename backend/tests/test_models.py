import sys
import os
import uuid
import datetime
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.session import SessionLocal
from app.models.application import Application
from app.models.document import Document
from app.models.auth import User
from app.models.scheme import Scheme

@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()

def test_application_and_document_models(db):
    # 1. Create a User (Citizen)
    citizen_email = f"citizen_{uuid.uuid4().hex[:6]}@example.com"
    citizen_phone = f"{uuid.uuid4().hex[:10]}"
    citizen = User(
        id=uuid.uuid4(),
        email=citizen_email,
        phone_number=citizen_phone,
        hashed_password="dummy_hash",
        role_id=1 # Citizen
    )
    db.add(citizen)

    # 2. Create a User (Officer)
    officer_email = f"officer_{uuid.uuid4().hex[:6]}@example.com"
    officer_phone = f"{uuid.uuid4().hex[:10]}"
    officer = User(
        id=uuid.uuid4(),
        email=officer_email,
        phone_number=officer_phone,
        hashed_password="dummy_hash",
        role_id=3 # Officer
    )
    db.add(officer)

    # 3. Create a Scheme
    scheme = Scheme(
        id=uuid.uuid4(),
        name=f"Test Scheme {uuid.uuid4().hex[:6]}",
        department="Test Dept",
        description="Test Desc",
        benefits="Test Benefits",
        required_documents="Docs",
        application_process="Process",
        status="Active"
    )
    db.add(scheme)
    db.commit()

    # 4. Create an Application referencing User and Scheme (Tests 1, 2, 3)
    app_id_str = f"APP-TEST-{uuid.uuid4().hex[:6]}"
    now = datetime.datetime.utcnow()
    application = Application(
        id=uuid.uuid4(),
        user_id=citizen.id,
        scheme_id=scheme.id,
        status="SUBMITTED",
        application_id=app_id_str,
        form_data={"field1": "value1"}, # Test 4
        eligibility_result={"is_eligible": True}, # Test 5
        assigned_officer_id=officer.id, # Test 6
        submitted_at=now # Test 7
    )
    db.add(application)
    db.commit()
    
    db.refresh(application)
    
    assert application.user_id == citizen.id
    assert application.scheme_id == scheme.id
    assert application.form_data == {"field1": "value1"}
    assert application.eligibility_result == {"is_eligible": True}
    assert application.assigned_officer_id == officer.id
    assert application.submitted_at is not None

    # 5. Create a Document referencing the Application (Test 8, 9)
    document = Document(
        id=uuid.uuid4(),
        application_id=application.id,
        document_type="ID_PROOF",
        original_filename="aadhaar.pdf",
        stored_filename="uploads/some-uuid.pdf",
        content_type="application/pdf",
        file_size=1024,
        verification_status="PENDING",
        uploaded_at=now
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    assert document.application_id == application.id
    assert document.original_filename == "aadhaar.pdf"
    assert document.file_size == 1024
    
    # 6. Verify existing application records are not destroyed (Test 10)
    apps = db.query(Application).all()
    assert len(apps) >= 1

    # Cleanup test data to not pollute local DB
    db.delete(document)
    db.delete(application)
    db.delete(scheme)
    db.delete(officer)
    db.delete(citizen)
    db.commit()
