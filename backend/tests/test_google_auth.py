import sys
import os
import pytest
from unittest.mock import patch, MagicMock

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

@patch('requests.get')
def test_google_login_valid_token(mock_get):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {"email": "testuser@example.com"}
    mock_get.return_value = mock_resp

    response = client.post("/api/v1/auth/google", json={
        "token": "valid_token",
        "role_id": 4
    })
    
    assert response.status_code == 200
    assert "access_token" in response.json()["data"]
    
@patch('requests.get')
def test_google_login_invalid_token(mock_get):
    mock_resp = MagicMock()
    mock_resp.status_code = 401
    mock_get.return_value = mock_resp

    response = client.post("/api/v1/auth/google", json={
        "token": "invalid_token",
        "role_id": 4
    })
    
    assert response.status_code == 401
    assert "Invalid Google token" in response.json()["message"]

@patch('requests.get')
def test_google_login_missing_email(mock_get):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {} # No email
    mock_get.return_value = mock_resp

    response = client.post("/api/v1/auth/google", json={
        "token": "token_no_email",
        "role_id": 4
    })
    
    assert response.status_code == 401
    assert "does not contain an email address" in response.json()["message"]

@patch('requests.get')
def test_google_login_api_failure(mock_get):
    import requests
    mock_get.side_effect = requests.RequestException("Connection error")

    response = client.post("/api/v1/auth/google", json={
        "token": "token",
        "role_id": 4
    })
    
    assert response.status_code == 401
    assert "Failed to communicate with Google" in response.json()["message"]
