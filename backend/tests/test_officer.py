import sys
import os
import uuid
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.db.session import SessionLocal
from app.models.auth import User, Role
from app.models.scheme import Scheme
from app.models.application import Application
from app.models.document import Document
from app.models.profile import CitizenProfile
from app.models.location import District, Mandal, Village
from app.core.security import create_access_token

client = TestClient(app)

@pytest.fixture(scope="module")
def db():
    session = SessionLocal()
    yield session
    session.close()

@pytest.fixture(scope="module")
def officer_test_setup(db):
    # Ensure roles exist
    for rid, rname in [(1, "Super Admin"), (2, "Mandal Admin"), (3, "Village Admin"), (4, "Citizen")]:
        if not db.query(Role).filter_by(id=rid).first():
            db.add(Role(id=rid, name=rname))
            
    # Ensure locations exist
    d1 = db.query(District).filter_by(id=101).first()
    if not d1:
        d1 = District(id=101, name="Officer Test District")
        db.add(d1)
    d2 = db.query(District).filter_by(id=102).first()
    if not d2:
        d2 = District(id=102, name="Other District")
        db.add(d2)
    db.commit()

    m1 = db.query(Mandal).filter_by(id=201).first()
    if not m1:
        m1 = Mandal(id=201, name="Officer Test Mandal", district_id=101)
        db.add(m1)
    m2 = db.query(Mandal).filter_by(id=202).first()
    if not m2:
        m2 = Mandal(id=202, name="Other Mandal", district_id=102)
        db.add(m2)
    db.commit()

    v1 = db.query(Village).filter_by(id=301).first()
    if not v1:
        v1 = Village(id=301, name="Officer Village 1", mandal_id=201)
        db.add(v1)
    v2 = db.query(Village).filter_by(id=302).first()
    if not v2:
        v2 = Village(id=302, name="Other Village 2", mandal_id=202)
        db.add(v2)
    db.commit()

    # Users
    citizen_id = uuid.uuid4()
    citizen = User(id=citizen_id, email=f"cit_{citizen_id}@test.com", hashed_password="pw", role_id=4)
    db.add(citizen)

    officer1_id = uuid.uuid4()
    officer1 = User(id=officer1_id, email=f"off1_{officer1_id}@test.com", hashed_password="pw", role_id=3)
    db.add(officer1)

    officer2_id = uuid.uuid4() # Different jurisdiction
    officer2 = User(id=officer2_id, email=f"off2_{officer2_id}@test.com", hashed_password="pw", role_id=3)
    db.add(officer2)

    super_admin_id = uuid.uuid4()
    super_admin = User(id=super_admin_id, email=f"admin_{super_admin_id}@test.com", hashed_password="pw", role_id=1)
    db.add(super_admin)

    db.commit()

    # Profiles
    p_cit = CitizenProfile(
        id=uuid.uuid4(),
        user_id=citizen_id,
        full_name="Citizen Tester",
        district_id=101,
        mandal_id=201,
        village_id=301
    )
    db.add(p_cit)

    p_off1 = CitizenProfile(
        id=uuid.uuid4(),
        user_id=officer1_id,
        full_name="Local Officer",
        district_id=101,
        mandal_id=201,
        village_id=301
    )
    db.add(p_off1)

    p_off2 = CitizenProfile(
        id=uuid.uuid4(),
        user_id=officer2_id,
        full_name="Distant Officer",
        district_id=102,
        mandal_id=202,
        village_id=302
    )
    db.add(p_off2)

    # Scheme
    scheme_id = uuid.uuid4()
    scheme = Scheme(
        id=scheme_id,
        name="Officer Workflow Test Scheme",
        department="Revenue",
        description="Scheme for officer workflow tests",
        benefits="Direct Benefit",
        required_documents="Aadhaar Card, Income Certificate",
        application_process="Online verification",
        status="Active"
    )
    db.add(scheme)
    db.commit()

    # Application 1: for review & approval
    app1_id = uuid.uuid4()
    app1 = Application(
        id=app1_id,
        user_id=citizen_id,
        scheme_id=scheme_id,
        application_id=f"TEST-APP-{uuid.uuid4().hex[:6].upper()}",
        status="SUBMITTED",
        form_data={"full_name": "Citizen Tester", "village_id": 301, "mandal_id": 201, "district_id": 101}
    )
    db.add(app1)

    # Documents for Application 1
    doc1_id = uuid.uuid4()
    doc1 = Document(
        id=doc1_id,
        application_id=app1_id,
        document_type="Aadhaar Card",
        original_filename="aadhaar.pdf",
        stored_filename="test_aadhaar.pdf",
        content_type="application/pdf",
        file_size=1024,
        verification_status="PENDING"
    )
    db.add(doc1)

    doc2_id = uuid.uuid4()
    doc2 = Document(
        id=doc2_id,
        application_id=app1_id,
        document_type="Income Certificate",
        original_filename="income.pdf",
        stored_filename="test_income.pdf",
        content_type="application/pdf",
        file_size=1024,
        verification_status="PENDING"
    )
    db.add(doc2)

    # Application 2: for rejection
    app2_id = uuid.uuid4()
    app2 = Application(
        id=app2_id,
        user_id=citizen_id,
        scheme_id=scheme_id,
        application_id=f"TEST-APP-{uuid.uuid4().hex[:6].upper()}",
        status="SUBMITTED",
        form_data={"full_name": "Citizen Tester", "village_id": 301}
    )
    db.add(app2)

    # Application 3: DRAFT state for testing invalid transitions
    app3_id = uuid.uuid4()
    app3 = Application(
        id=app3_id,
        user_id=citizen_id,
        scheme_id=scheme_id,
        application_id=f"TEST-APP-{uuid.uuid4().hex[:6].upper()}",
        status="DRAFT",
        form_data={"full_name": "Citizen Tester"}
    )
    db.add(app3)

    db.commit()

    return {
        "citizen_token": create_access_token(citizen_id),
        "officer1_token": create_access_token(officer1_id),
        "officer2_token": create_access_token(officer2_id),
        "admin_token": create_access_token(super_admin_id),
        "app1_id": app1_id,
        "app2_id": app2_id,
        "app3_id": app3_id,
        "doc1_id": doc1_id,
        "doc2_id": doc2_id,
        "scheme_id": scheme_id,
    }


def test_1_authorized_officer_can_retrieve_queue(officer_test_setup):
    headers = {"Authorization": f"Bearer {officer_test_setup['officer1_token']}"}
    resp = client.get("/api/v1/officer/applications", headers=headers)
    assert resp.status_code == 200
    data = resp.json()["data"]
    app_ids = [a["id"] for a in data]
    assert str(officer_test_setup["app1_id"]) in app_ids


def test_2_citizen_cannot_access_officer_queue(officer_test_setup):
    headers = {"Authorization": f"Bearer {officer_test_setup['citizen_token']}"}
    resp = client.get("/api/v1/officer/applications", headers=headers)
    assert resp.status_code == 403


def test_3_unauthorized_officer_cannot_access_outside_jurisdiction(officer_test_setup):
    headers = {"Authorization": f"Bearer {officer_test_setup['officer2_token']}"}
    # Officer 2 is in village 302, app1 is in village 301
    resp = client.get(f"/api/v1/officer/applications/{officer_test_setup['app1_id']}", headers=headers)
    assert resp.status_code == 403


def test_4_officer_can_start_review(officer_test_setup):
    headers = {"Authorization": f"Bearer {officer_test_setup['officer1_token']}"}
    resp = client.put(f"/api/v1/officer/applications/{officer_test_setup['app1_id']}/review", headers=headers)
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["status"] == "UNDER_REVIEW"
    assert data["reviewed_at"] is not None


def test_5_officer_can_verify_accessible_document(officer_test_setup):
    headers = {"Authorization": f"Bearer {officer_test_setup['officer1_token']}"}
    doc1_id = officer_test_setup["doc1_id"]
    payload = {
        "verification_status": "VERIFIED",
        "officer_remarks": "Aadhaar Card is clear and valid."
    }
    resp = client.put(f"/api/v1/officer/documents/{doc1_id}/verify", json=payload, headers=headers)
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["verification_status"] == "VERIFIED"
    assert data["verified_at"] is not None
    assert data["officer_remarks"] == "Aadhaar Card is clear and valid."


def test_6_officer_cannot_verify_document_outside_jurisdiction(officer_test_setup):
    headers = {"Authorization": f"Bearer {officer_test_setup['officer2_token']}"}
    doc1_id = officer_test_setup["doc1_id"]
    payload = {"verification_status": "VERIFIED"}
    resp = client.put(f"/api/v1/officer/documents/{doc1_id}/verify", json=payload, headers=headers)
    assert resp.status_code == 403


def test_7_approval_fails_when_required_documents_pending_or_missing(officer_test_setup):
    headers = {"Authorization": f"Bearer {officer_test_setup['officer1_token']}"}
    # doc2 (Income Certificate) is still PENDING
    payload = {"officer_remarks": "Ready to approve"}
    resp = client.put(f"/api/v1/officer/applications/{officer_test_setup['app1_id']}/approve", json=payload, headers=headers)
    assert resp.status_code == 400
    assert "verified" in resp.json()["message"].lower() or "pending" in resp.json()["message"].lower()


def test_8_officer_verifies_second_document_and_approves(officer_test_setup):
    headers = {"Authorization": f"Bearer {officer_test_setup['officer1_token']}"}
    doc2_id = officer_test_setup["doc2_id"]
    # Verify second document
    resp = client.put(f"/api/v1/officer/documents/{doc2_id}/verify", json={"verification_status": "VERIFIED", "officer_remarks": "Income verified."}, headers=headers)
    assert resp.status_code == 200

    # Now approve
    approve_resp = client.put(
        f"/api/v1/officer/applications/{officer_test_setup['app1_id']}/approve",
        json={"officer_remarks": "All documents verified and criteria satisfied."},
        headers=headers
    )
    assert approve_resp.status_code == 200
    data = approve_resp.json()["data"]
    assert data["status"] == "APPROVED"
    assert data["decision_at"] is not None
    assert data["officer_remarks"] == "All documents verified and criteria satisfied."


def test_9_rejection_requires_meaningful_reason(officer_test_setup):
    headers = {"Authorization": f"Bearer {officer_test_setup['officer1_token']}"}
    # Blank rejection remarks
    resp = client.put(
        f"/api/v1/officer/applications/{officer_test_setup['app2_id']}/reject",
        json={"officer_remarks": "   "},
        headers=headers
    )
    assert resp.status_code == 400


def test_10_rejection_succeeds_for_valid_application(officer_test_setup):
    headers = {"Authorization": f"Bearer {officer_test_setup['officer1_token']}"}
    resp = client.put(
        f"/api/v1/officer/applications/{officer_test_setup['app2_id']}/reject",
        json={"officer_remarks": "Discrepancy found in applicant residential address."},
        headers=headers
    )
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["status"] == "REJECTED"
    assert data["decision_at"] is not None
    assert data["officer_remarks"] == "Discrepancy found in applicant residential address."


def test_11_invalid_state_transitions_rejected(officer_test_setup):
    headers = {"Authorization": f"Bearer {officer_test_setup['officer1_token']}"}
    # Cannot approve DRAFT application
    resp = client.put(
        f"/api/v1/officer/applications/{officer_test_setup['app3_id']}/approve",
        json={"officer_remarks": "Direct draft approve"},
        headers=headers
    )
    assert resp.status_code == 400

    # Cannot review DRAFT application directly
    resp = client.put(f"/api/v1/officer/applications/{officer_test_setup['app3_id']}/review", headers=headers)
    assert resp.status_code == 400


def test_12_contradictory_repeat_decisions_rejected(officer_test_setup):
    headers = {"Authorization": f"Bearer {officer_test_setup['officer1_token']}"}
    # App 1 is already APPROVED; reject should fail
    resp = client.put(
        f"/api/v1/officer/applications/{officer_test_setup['app1_id']}/reject",
        json={"officer_remarks": "Changing mind"},
        headers=headers
    )
    assert resp.status_code == 400

    # App 2 is already REJECTED; approve should fail
    resp = client.put(
        f"/api/v1/officer/applications/{officer_test_setup['app2_id']}/approve",
        json={"officer_remarks": "Changing mind"},
        headers=headers
    )
    assert resp.status_code == 400


def test_13_super_admin_has_global_access(officer_test_setup):
    headers = {"Authorization": f"Bearer {officer_test_setup['admin_token']}"}
    # Admin can list applications across any jurisdiction
    resp = client.get("/api/v1/admin/applications", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()["data"]) >= 1


def test_14_citizen_can_track_decided_application(officer_test_setup):
    headers = {"Authorization": f"Bearer {officer_test_setup['citizen_token']}"}
    # Citizen checks application 1
    resp = client.get(f"/api/v1/applications/{officer_test_setup['app1_id']}", headers=headers)
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert data["status"] == "APPROVED"
    assert data["decision_at"] is not None
    assert data["officer_remarks"] == "All documents verified and criteria satisfied."

    # Citizen checks application 2
    resp2 = client.get(f"/api/v1/applications/{officer_test_setup['app2_id']}", headers=headers)
    assert resp2.status_code == 200
    data2 = resp2.json()["data"]
    assert data2["status"] == "REJECTED"
    assert data2["officer_remarks"] == "Discrepancy found in applicant residential address."


def test_15_document_cannot_be_verified_once_application_decided(officer_test_setup):
    headers = {"Authorization": f"Bearer {officer_test_setup['officer1_token']}"}
    doc1_id = officer_test_setup["doc1_id"]
    # App 1 is already APPROVED
    resp = client.put(
        f"/api/v1/officer/documents/{doc1_id}/verify",
        json={"verification_status": "REJECTED"},
        headers=headers
    )
    assert resp.status_code == 400
