import sys
import os
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

response = client.get("/api/v1/health")
assert response.status_code == 200, f"Health check failed: {response.text}"
print("Health check OK.")

response = client.get("/api/v1/openapi.json")
assert response.status_code == 200, f"OpenAPI docs failed: {response.text}"
assert "openapi" in response.json(), "Invalid OpenAPI JSON format"
print("OpenAPI/Swagger documentation generated OK.")

print("FastAPI verification completed successfully!")
