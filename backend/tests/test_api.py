import sys
import os
import pytest
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["success"] == True
    
def test_version():
    response = client.get("/api/v1/version")
    assert response.status_code == 200
    
def test_auth_register_validation():
    response = client.post("/api/v1/auth/register", json={})
    assert response.status_code == 422
    
def test_schemes_unauthorized():
    response = client.get("/api/v1/schemes/saved/me")
    assert response.status_code == 401

def test_agriculture_public():
    response = client.get("/api/v1/agriculture/market-prices")
    assert response.status_code == 200
    assert len(response.json()["data"]) > 0
