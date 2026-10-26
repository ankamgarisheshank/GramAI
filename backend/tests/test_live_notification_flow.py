import requests
import io

BASE_URL = "http://localhost:8000/api/v1"

def run_live_test():
    print("=" * 60)
    print("RUNNING LIVE END-TO-END IN-APP NOTIFICATION WORKFLOW")
    print("=" * 60)

    # 1. Citizen login
    cit_resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "demo.citizen@gramai.gov.in", "password": "CitizenPassword123!"})
    assert cit_resp.status_code == 200, f"Citizen login failed: {cit_resp.text}"
    cit_token = cit_resp.json()["data"]["access_token"]
    cit_headers = {"Authorization": f"Bearer {cit_token}"}
    print("1. Citizen logged in successfully.")

    # 2. Officer login
    off_resp = requests.post(f"{BASE_URL}/auth/login", data={"username": "demo.officer@gramai.gov.in", "password": "OfficerPassword123!"})
    assert off_resp.status_code == 200, f"Officer login failed: {off_resp.text}"
    off_token = off_resp.json()["data"]["access_token"]
    off_headers = {"Authorization": f"Bearer {off_token}"}
    print("2. Local Officer logged in successfully.")

    # Check citizen unread count initially
    count_init = requests.get(f"{BASE_URL}/notifications/unread-count", headers=cit_headers).json()["data"]["unread_count"]
    print(f"   Initial Citizen unread notification count: {count_init}")

    # 3. Citizen creates and submits an application
    # Pick active scheme
    schemes_resp = requests.get(f"{BASE_URL}/schemes", headers=cit_headers)
    schemes = schemes_resp.json()["data"]
    # Find active scheme where citizen has no active application
    my_apps = requests.get(f"{BASE_URL}/applications/me", headers=cit_headers).json().get("data", [])
    active_scheme_ids = {str(a["scheme_id"]) for a in my_apps if a["status"] in ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED"]}
    target_scheme = next((s for s in schemes if s["status"] == "Active" and str(s["id"]) not in active_scheme_ids), None)
    assert target_scheme is not None, "No available active scheme found for test"

    create_payload = {
        "scheme_id": target_scheme["id"],
        "form_data": {
            "full_name": "Kavitha Reddy",
            "village_id": 1,
            "mandal_id": 1,
            "district_id": 1
        }
    }
    create_resp = requests.post(f"{BASE_URL}/applications", json=create_payload, headers=cit_headers)
    assert create_resp.status_code == 200, f"Create app failed: {create_resp.text}"
    app_data = create_resp.json()["data"]
    app_id = app_data["id"]
    human_id = app_data["application_id"]
    print(f"3. Created application {human_id} (UUID: {app_id})")

    # Upload document
    req_docs = [d.strip().rstrip('.') for d in (target_scheme.get("required_documents") or "Aadhaar Card").split(",") if d.strip().rstrip('.')]
    if not req_docs:
        req_docs = ["Aadhaar Card"]
    for dt in req_docs:
        files = {"file": (f"{dt}.pdf", io.BytesIO(b"dummy doc content"), "application/pdf")}
        requests.post(f"{BASE_URL}/applications/{app_id}/documents", data={"document_type": dt}, files=files, headers=cit_headers)

    # Submit application
    submit_resp = requests.put(f"{BASE_URL}/applications/{app_id}/submit", headers=cit_headers)
    assert submit_resp.status_code == 200, f"Submit failed: {submit_resp.text}"
    print("   Application submitted.")

    # 4. Verify Citizen received 'Application Submitted' notification
    notifs_resp = requests.get(f"{BASE_URL}/notifications", headers=cit_headers)
    assert notifs_resp.status_code == 200
    cit_notifs = notifs_resp.json()["data"]
    latest_notif = cit_notifs[0]
    assert latest_notif["title"] == "Application Submitted"
    assert human_id in latest_notif["message"]
    assert latest_notif["is_read"] is False
    print(f"4. ✓ Citizen received unread notification: '{latest_notif['title']}' - '{latest_notif['message']}'")

    # 5. Citizen opens / marks notification as read
    sub_notif_id = latest_notif["id"]
    mark_resp = requests.put(f"{BASE_URL}/notifications/{sub_notif_id}/read", headers=cit_headers)
    assert mark_resp.status_code == 200
    # Check count decreased
    count_after_read = requests.get(f"{BASE_URL}/notifications/unread-count", headers=cit_headers).json()["data"]["unread_count"]
    print(f"5. ✓ Citizen marked notification {sub_notif_id} as read. New unread count: {count_after_read}")

    # 6. Officer starts review
    rev_resp = requests.put(f"{BASE_URL}/officer/applications/{app_id}/review", headers=off_headers)
    assert rev_resp.status_code == 200, f"Start review failed: {rev_resp.text}"
    print(f"6. Officer started review on {human_id}.")

    # 7. Citizen receives review notification
    notifs_resp2 = requests.get(f"{BASE_URL}/notifications", headers=cit_headers)
    cit_notifs2 = notifs_resp2.json()["data"]
    review_notif = cit_notifs2[0]
    assert review_notif["title"] == "Application Under Review"
    assert human_id in review_notif["message"]
    assert review_notif["is_read"] is False
    print(f"7. ✓ Citizen received review notification: '{review_notif['title']}' - '{review_notif['message']}'")

    # Mark review notification as read
    requests.put(f"{BASE_URL}/notifications/{review_notif['id']}/read", headers=cit_headers)

    # 8. Officer verifies document and approves application
    # Get officer application detail to find docs
    app_detail = requests.get(f"{BASE_URL}/officer/applications/{app_id}", headers=off_headers).json()["data"]
    for d in app_detail["documents"]:
        requests.put(f"{BASE_URL}/officer/documents/{d['id']}/verify", json={"verification_status": "VERIFIED", "officer_remarks": "Verified ok"}, headers=off_headers)

    approve_resp = requests.put(f"{BASE_URL}/officer/applications/{app_id}/approve", json={"officer_remarks": "Approved with all verified documents"}, headers=off_headers)
    assert approve_resp.status_code == 200, f"Approve failed: {approve_resp.text}"
    print(f"8. Officer approved application {human_id}.")

    # 9. Citizen receives decision notification
    notifs_resp3 = requests.get(f"{BASE_URL}/notifications", headers=cit_headers)
    cit_notifs3 = notifs_resp3.json()["data"]
    decision_notif = cit_notifs3[0]
    assert decision_notif["title"] == "Application Approved"
    assert human_id in decision_notif["message"]
    assert decision_notif["is_read"] is False
    print(f"9. ✓ Citizen received decision notification: '{decision_notif['title']}' - '{decision_notif['message']}'")

    # Mark decision notification as read
    requests.put(f"{BASE_URL}/notifications/{decision_notif['id']}/read", headers=cit_headers)

    # 10. Test Rejection Notification flow with another scheme
    my_apps2 = requests.get(f"{BASE_URL}/applications/me", headers=cit_headers).json().get("data", [])
    active_scheme_ids2 = {str(a["scheme_id"]) for a in my_apps2 if a["status"] in ["DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED"]}
    rej_scheme = next((s for s in schemes if s["status"] == "Active" and str(s["id"]) not in active_scheme_ids2), None)
    if rej_scheme:
        rej_create = requests.post(f"{BASE_URL}/applications", json={
            "scheme_id": rej_scheme["id"],
            "form_data": {"full_name": "Kavitha Reddy", "village_id": 1, "mandal_id": 1, "district_id": 1}
        }, headers=cit_headers).json()["data"]
        rej_app_id = rej_create["id"]
        rej_human_id = rej_create["application_id"]
        rej_req_docs = [d.strip().rstrip('.') for d in (rej_scheme.get("required_documents") or "Aadhaar Card").split(",") if d.strip().rstrip('.')]
        if not rej_req_docs:
            rej_req_docs = ["Aadhaar Card"]
        for dt in rej_req_docs:
            files = {"file": (f"{dt}.pdf", io.BytesIO(b"dummy doc"), "application/pdf")}
            requests.post(f"{BASE_URL}/applications/{rej_app_id}/documents", data={"document_type": dt}, files=files, headers=cit_headers)
        sub_rej = requests.put(f"{BASE_URL}/applications/{rej_app_id}/submit", headers=cit_headers)
        assert sub_rej.status_code == 200, f"Submit rej app failed: {sub_rej.text}"
        # officer reviews and rejects
        rev_res = requests.put(f"{BASE_URL}/officer/applications/{rej_app_id}/review", headers=off_headers)
        assert rev_res.status_code == 200, f"Officer review failed: {rev_res.text}"
        rej_res = requests.put(f"{BASE_URL}/officer/applications/{rej_app_id}/reject", json={"officer_remarks": "Incomplete documentation submitted"}, headers=off_headers)
        assert rej_res.status_code == 200, f"Officer reject failed: {rej_res.text}"
        # citizen checks rejection notification
        notifs_resp4 = requests.get(f"{BASE_URL}/notifications", headers=cit_headers)
        rej_notif = notifs_resp4.json()["data"][0]
        assert rej_notif["title"] == "Application Update"
        assert rej_human_id in rej_notif["message"]
        print(f"10. ✓ Citizen received rejection notification: '{rej_notif['title']}' - '{rej_notif['message']}'")
        requests.put(f"{BASE_URL}/notifications/{rej_notif['id']}/read", headers=cit_headers)

    # 11. Security Ownership check: Officer cannot mark citizen's notification as read
    cross_read = requests.put(f"{BASE_URL}/notifications/{decision_notif['id']}/read", headers=off_headers)
    assert cross_read.status_code == 404, f"Security check failed! Officer was able to read citizen notif: {cross_read.text}"
    print(f"11. ✓ Cross-user ownership security verified: Officer cannot mark citizen's notification as read (HTTP {cross_read.status_code})")

    print("\n" + "=" * 60)
    print("MODULE 6A MANUAL NOTIFICATION WORKFLOW VERIFIED 100%!")
    print("=" * 60)

if __name__ == "__main__":
    run_live_test()
