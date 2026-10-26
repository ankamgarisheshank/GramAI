import sys
import os
import uuid
import io
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app
from app.db.session import SessionLocal
from app.models.auth import User, Role
from app.models.scheme import Scheme
from app.models.application import Application
from app.models.document import Document
from app.models.communication import Notification
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
def notif_setup(db):
    # Ensure roles exist
    for rid, rname in [(1, "Super Admin"), (2, "Mandal Admin"), (3, "Village Admin"), (4, "Citizen")]:
        if not db.query(Role).filter_by(id=rid).first():
            db.add(Role(id=rid, name=rname))
    db.commit()

    # Ensure location
    dist = db.query(District).filter_by(id=501).first()
    if not dist:
        dist = District(id=501, name="Notif District")
        db.add(dist)
    mandal = db.query(Mandal).filter_by(id=601).first()
    if not mandal:
        mandal = Mandal(id=601, name="Notif Mandal", district_id=501)
        db.add(mandal)
    village = db.query(Village).filter_by(id=701).first()
    if not village:
        village = Village(id=701, name="Notif Village", mandal_id=601)
        db.add(village)
    db.commit()

    # Create citizen A
    cit_a = db.query(User).filter_by(email="notif.cit.a@test.gov.in").first()
    if not cit_a:
        cit_a = User(
            id=uuid.uuid4(),
            email="notif.cit.a@test.gov.in",
            hashed_password="hash",
            role_id=4,
            is_active=True
        )
        db.add(cit_a)
        db.commit()
        db.add(CitizenProfile(user_id=cit_a.id, full_name="Citizen A", village_id=701, mandal_id=601, district_id=501))
        db.commit()

    # Create citizen B
    cit_b = db.query(User).filter_by(email="notif.cit.b@test.gov.in").first()
    if not cit_b:
        cit_b = User(
            id=uuid.uuid4(),
            email="notif.cit.b@test.gov.in",
            hashed_password="hash",
            role_id=4,
            is_active=True
        )
        db.add(cit_b)
        db.commit()
        db.add(CitizenProfile(user_id=cit_b.id, full_name="Citizen B", village_id=701, mandal_id=601, district_id=501))
        db.commit()

    # Create officer (Super Admin for jurisdiction)
    officer = db.query(User).filter_by(email="notif.officer@test.gov.in").first()
    if not officer:
        officer = User(
            id=uuid.uuid4(),
            email="notif.officer@test.gov.in",
            hashed_password="hash",
            role_id=1,
            is_active=True
        )
        db.add(officer)
        db.commit()

    cit_a_token = create_access_token(cit_a.id)
    cit_b_token = create_access_token(cit_b.id)
    officer_token = create_access_token(officer.id)

    return {
        "cit_a": cit_a,
        "cit_b": cit_b,
        "officer": officer,
        "cit_a_token": cit_a_token,
        "cit_b_token": cit_b_token,
        "officer_token": officer_token,
    }


def create_and_submit_app(setup, db, scheme_name="App Test Scheme"):
    headers = {"Authorization": f"Bearer {setup['cit_a_token']}"}
    scheme = Scheme(
        id=uuid.uuid4(),
        name=f"{scheme_name} {uuid.uuid4().hex[:6]}",
        department="Revenue",
        description="Test scheme",
        benefits="Benefit Aid",
        required_documents="Aadhaar Card",
        application_process="Online verification",
        status="Active"
    )
    db.add(scheme)
    db.commit()

    create_resp = client.post(
        "/api/v1/applications",
        json={"scheme_id": str(scheme.id), "form_data": {"village_id": 701, "mandal_id": 601, "district_id": 501}},
        headers=headers
    )
    assert create_resp.status_code == 200
    app_id = create_resp.json()["data"]["id"]

    files = {"file": ("aadhaar.pdf", io.BytesIO(b"fake doc"), "application/pdf")}
    upload_resp = client.post(f"/api/v1/applications/{app_id}/documents", data={"document_type": "Aadhaar Card"}, files=files, headers=headers)
    assert upload_resp.status_code == 200

    submit_resp = client.put(f"/api/v1/applications/{app_id}/submit", headers=headers)
    assert submit_resp.status_code == 200
    return app_id


def test_1_application_submission_creates_notification(notif_setup, db):
    setup = notif_setup
    headers = {"Authorization": f"Bearer {setup['cit_a_token']}"}

    scheme = Scheme(
        id=uuid.uuid4(),
        name=f"Submit Test Scheme {uuid.uuid4().hex[:6]}",
        department="Revenue",
        description="Test scheme",
        benefits="Benefit Aid",
        required_documents="Aadhaar Card",
        application_process="Online verification",
        status="Active"
    )
    db.add(scheme)
    db.commit()

    create_resp = client.post(
        "/api/v1/applications",
        json={"scheme_id": str(scheme.id), "form_data": {"village_id": 701, "mandal_id": 601, "district_id": 501}},
        headers=headers
    )
    assert create_resp.status_code == 200
    app_id = create_resp.json()["data"]["id"]

    files = {"file": ("aadhaar.pdf", io.BytesIO(b"fake doc"), "application/pdf")}
    client.post(f"/api/v1/applications/{app_id}/documents", data={"document_type": "Aadhaar Card"}, files=files, headers=headers)

    notifs_before = db.query(Notification).filter(Notification.user_id == setup["cit_a"].id).count()

    # Submit application
    submit_resp = client.put(f"/api/v1/applications/{app_id}/submit", headers=headers)
    assert submit_resp.status_code == 200

    notifs_after = db.query(Notification).filter(Notification.user_id == setup["cit_a"].id).all()
    assert len(notifs_after) == notifs_before + 1

    latest = notifs_after[-1]
    assert latest.title == "Application Submitted"
    assert "submitted successfully" in latest.message
    assert latest.is_read is False


def test_2_entering_under_review_creates_notification(notif_setup, db):
    setup = notif_setup
    officer_headers = {"Authorization": f"Bearer {setup['officer_token']}"}
    app_id = create_and_submit_app(setup, db, "Review Test Scheme")

    notifs_before = db.query(Notification).filter(Notification.user_id == setup["cit_a"].id).count()

    # Officer starts review
    review_resp = client.put(f"/api/v1/officer/applications/{app_id}/review", headers=officer_headers)
    assert review_resp.status_code == 200

    notifs_after = db.query(Notification).filter(Notification.user_id == setup["cit_a"].id).all()
    assert len(notifs_after) == notifs_before + 1

    latest = notifs_after[-1]
    assert latest.title == "Application Under Review"
    assert "now being reviewed" in latest.message
    assert latest.is_read is False


def test_3_approval_creates_notification(notif_setup, db):
    setup = notif_setup
    officer_headers = {"Authorization": f"Bearer {setup['officer_token']}"}
    app_id = create_and_submit_app(setup, db, "Approve Test Scheme")

    # Start review and verify document first so approval succeeds
    client.put(f"/api/v1/officer/applications/{app_id}/review", headers=officer_headers)
    doc = db.query(Document).filter(Document.application_id == uuid.UUID(app_id)).first()
    client.put(
        f"/api/v1/officer/documents/{doc.id}/verify",
        json={"verification_status": "VERIFIED", "officer_remarks": "All good"},
        headers=officer_headers
    )

    notifs_before = db.query(Notification).filter(Notification.user_id == setup["cit_a"].id).count()

    # Officer approves
    approve_resp = client.put(
        f"/api/v1/officer/applications/{app_id}/approve",
        json={"officer_remarks": "Approved by testing officer"},
        headers=officer_headers
    )
    assert approve_resp.status_code == 200

    notifs_after = db.query(Notification).filter(Notification.user_id == setup["cit_a"].id).all()
    assert len(notifs_after) == notifs_before + 1

    latest = notifs_after[-1]
    assert latest.title == "Application Approved"
    assert "has been approved" in latest.message


def test_4_rejection_creates_notification(notif_setup, db):
    setup = notif_setup
    officer_headers = {"Authorization": f"Bearer {setup['officer_token']}"}
    app_id = create_and_submit_app(setup, db, "Reject Test Scheme")

    notifs_before = db.query(Notification).filter(Notification.user_id == setup["cit_a"].id).count()

    # Officer rejects
    reject_resp = client.put(
        f"/api/v1/officer/applications/{app_id}/reject",
        json={"officer_remarks": "Applicant does not satisfy criteria"},
        headers=officer_headers
    )
    assert reject_resp.status_code == 200

    notifs_after = db.query(Notification).filter(Notification.user_id == setup["cit_a"].id).all()
    assert len(notifs_after) == notifs_before + 1

    latest = notifs_after[-1]
    assert latest.title == "Application Update"
    assert "has been rejected" in latest.message


def test_5_invalid_state_transitions_do_not_create_duplicate_notifications(notif_setup, db):
    setup = notif_setup
    officer_headers = {"Authorization": f"Bearer {setup['officer_token']}"}
    app_id = create_and_submit_app(setup, db, "Invalid Trans Scheme")

    # Move to under review and approve
    client.put(f"/api/v1/officer/applications/{app_id}/review", headers=officer_headers)
    doc = db.query(Document).filter(Document.application_id == uuid.UUID(app_id)).first()
    client.put(
        f"/api/v1/officer/documents/{doc.id}/verify",
        json={"verification_status": "VERIFIED", "officer_remarks": "Verified"},
        headers=officer_headers
    )
    client.put(
        f"/api/v1/officer/applications/{app_id}/approve",
        json={"officer_remarks": "Approved"},
        headers=officer_headers
    )

    notifs_before = db.query(Notification).filter(Notification.user_id == setup["cit_a"].id).count()

    # 1. Attempt repeat approval on already approved app
    repeat_approve = client.put(
        f"/api/v1/officer/applications/{app_id}/approve",
        json={"officer_remarks": "Repeat approval"},
        headers=officer_headers
    )
    assert repeat_approve.status_code == 400

    # 2. Attempt review on already approved app
    repeat_review = client.put(
        f"/api/v1/officer/applications/{app_id}/review",
        headers=officer_headers
    )
    assert repeat_review.status_code == 400

    # 3. Attempt reject on already approved app
    repeat_reject = client.put(
        f"/api/v1/officer/applications/{app_id}/reject",
        json={"officer_remarks": "Contradictory reject"},
        headers=officer_headers
    )
    assert repeat_reject.status_code == 400

    notifs_after = db.query(Notification).filter(Notification.user_id == setup["cit_a"].id).count()
    assert notifs_after == notifs_before, "No duplicate notifications should be created on rejected actions"


def test_6_user_can_list_own_notifications(notif_setup):
    setup = notif_setup
    headers = {"Authorization": f"Bearer {setup['cit_a_token']}"}

    resp = client.get("/api/v1/notifications", headers=headers)
    assert resp.status_code == 200
    data = resp.json()["data"]
    assert isinstance(data, list)
    assert len(data) >= 1
    # Check structure and ownership
    for item in data:
        assert item["user_id"] == str(setup["cit_a"].id)
        assert "title" in item
        assert "message" in item
        assert "is_read" in item
        assert "created_at" in item


def test_7_user_cannot_read_another_users_notifications(notif_setup, db):
    setup = notif_setup
    headers_b = {"Authorization": f"Bearer {setup['cit_b_token']}"}

    # Find a notification belonging to Citizen A
    notif_a = db.query(Notification).filter(Notification.user_id == setup["cit_a"].id).first()
    assert notif_a is not None

    # Citizen B attempts to mark Citizen A's notification as read
    tamper_resp = client.put(f"/api/v1/notifications/{notif_a.id}/read", headers=headers_b)
    # Must return 404 Not Found since it does not belong to Citizen B
    assert tamper_resp.status_code == 404

    # Notification list of Citizen B should not include Citizen A's notifications
    list_b = client.get("/api/v1/notifications", headers=headers_b)
    assert list_b.status_code == 200
    ids_in_b = [n["id"] for n in list_b.json()["data"]]
    assert notif_a.id not in ids_in_b


def test_8_marking_notification_as_read_updates_state(notif_setup, db):
    setup = notif_setup
    headers = {"Authorization": f"Bearer {setup['cit_a_token']}"}

    # Pick an unread notification belonging to Citizen A
    unread = db.query(Notification).filter(Notification.user_id == setup["cit_a"].id, Notification.is_read == False).first()
    assert unread is not None
    notif_id = unread.id

    mark_resp = client.put(f"/api/v1/notifications/{notif_id}/read", headers=headers)
    assert mark_resp.status_code == 200

    db.expire_all()
    updated = db.query(Notification).filter(Notification.id == notif_id).first()
    assert updated.is_read is True


def test_9_unread_count_changes_correctly(notif_setup, db):
    setup = notif_setup
    headers = {"Authorization": f"Bearer {setup['cit_a_token']}"}

    # Get count via API
    count_resp = client.get("/api/v1/notifications/unread-count", headers=headers)
    assert count_resp.status_code == 200
    initial_unread = count_resp.json()["data"]["unread_count"]

    # If there is another unread, mark it and verify decrement
    unread = db.query(Notification).filter(Notification.user_id == setup["cit_a"].id, Notification.is_read == False).first()
    if unread:
        client.put(f"/api/v1/notifications/{unread.id}/read", headers=headers)
        new_count_resp = client.get("/api/v1/notifications/unread-count", headers=headers)
        assert new_count_resp.status_code == 200
        new_unread = new_count_resp.json()["data"]["unread_count"]
        assert new_unread == initial_unread - 1
    else:
        # Create an unread notification directly to test count increment/decrement
        new_notif = Notification(user_id=setup["cit_a"].id, title="Test Count", message="Testing count", is_read=False)
        db.add(new_notif)
        db.commit()

        count_after = client.get("/api/v1/notifications/unread-count", headers=headers).json()["data"]["unread_count"]
        assert count_after == initial_unread + 1

        client.put(f"/api/v1/notifications/{new_notif.id}/read", headers=headers)
        count_final = client.get("/api/v1/notifications/unread-count", headers=headers).json()["data"]["unread_count"]
        assert count_final == initial_unread
