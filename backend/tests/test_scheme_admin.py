import sys
import os
import uuid
import pytest
from unittest.mock import MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app
from app.models.auth import User
from app.core.exceptions import AppException

client = TestClient(app)

# Dummy users
admin_user = User(id=uuid.uuid4(), email="admin@example.com", role_id=4)

def override_admin_success():
    return admin_user

def override_admin_forbidden():
    raise AppException("Not enough permissions to access this resource", status_code=403)

from app.api.v1.admin import admin_only

def setup_function():
    app.dependency_overrides[admin_only] = override_admin_success

def teardown_function():
    app.dependency_overrides.clear()

def test_admin_create_valid_scheme():
    payload = {
        "name": "Test Scheme Create",
        "department": "Test Dept",
        "description": "Test Desc",
        "benefits": "Test Benefits",
        "required_documents": "Docs",
        "application_process": "Process",
        "status": "Active"
    }
    response = client.post("/api/v1/admin/schemes", json=payload)
    assert response.status_code == 201
    assert response.json()["data"]["name"] == "Test Scheme Create"

def test_admin_create_invalid_age():
    payload = {
        "name": "Invalid Age Scheme",
        "department": "Test Dept",
        "description": "Test Desc",
        "benefits": "Test Benefits",
        "required_documents": "Docs",
        "application_process": "Process",
        "age_limit_min": 60,
        "age_limit_max": 30
    }
    response = client.post("/api/v1/admin/schemes", json=payload)
    assert response.status_code == 400
    assert "Invalid age range" in response.json()["message"]

def test_admin_create_invalid_category():
    payload = {
        "name": "Invalid Category Scheme",
        "department": "Test Dept",
        "description": "Test Desc",
        "benefits": "Test Benefits",
        "required_documents": "Docs",
        "application_process": "Process",
        "category_id": 99999
    }
    response = client.post("/api/v1/admin/schemes", json=payload)
    assert response.status_code == 400
    assert "Invalid category ID" in response.json()["message"]

def test_admin_update_existing_scheme():
    # First create one
    create_payload = {
        "name": "Scheme To Update",
        "department": "Test Dept",
        "description": "Test Desc",
        "benefits": "Test Benefits",
        "required_documents": "Docs",
        "application_process": "Process",
        "status": "Active"
    }
    create_response = client.post("/api/v1/admin/schemes", json=create_payload)
    scheme_id = create_response.json()["data"]["id"]

    # Now update it
    update_payload = {
        "name": "Updated Scheme Name",
        "status": "Inactive"
    }
    response = client.put(f"/api/v1/admin/schemes/{scheme_id}", json=update_payload)
    assert response.status_code == 200
    assert response.json()["data"]["name"] == "Updated Scheme Name"
    assert response.json()["data"]["status"] == "Inactive"

def test_admin_update_nonexistent_scheme():
    fake_id = str(uuid.uuid4())
    update_payload = {
        "name": "Should Fail",
    }
    response = client.put(f"/api/v1/admin/schemes/{fake_id}", json=update_payload)
    assert response.status_code == 404
    assert "Scheme not found" in response.json()["message"]

def test_missing_scheme_name():
    payload = {
        "department": "Test Dept",
        "description": "Test Desc",
        "benefits": "Test Benefits",
        "required_documents": "Docs",
        "application_process": "Process"
    }
    response = client.post("/api/v1/admin/schemes", json=payload)
    assert response.status_code == 422

def test_non_admin_cannot_create_scheme():
    # Simulate a user without admin permissions trying to hit the endpoint
    app.dependency_overrides[admin_only] = override_admin_forbidden
    
    payload = {
        "name": "Hacker Scheme",
        "department": "Test Dept",
        "description": "Test Desc",
        "benefits": "Test Benefits",
        "required_documents": "Docs",
        "application_process": "Process"
    }
    
    response = client.post("/api/v1/admin/schemes", json=payload)
    assert response.status_code == 403
    assert "Not enough permissions" in response.json()["message"]
