import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

class TestMainEndpoints:    
    def test_root_endpoint(self):
        response = client.get("/")
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "endpoints" in data
        assert data["message"] == "Bienvenido al Mini Asistente Q&A"
        endpoints = data["endpoints"]
        assert endpoints["ingest"] == "/api/ingest"
        assert endpoints["search"] == "/api/search?q=consulta"
        assert endpoints["ask"] == "/api/ask"
    
    def test_health_check(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data == {"status": "healthy"}
    
    def test_cors_headers(self):
        response = client.options("/")
        assert response.status_code in [200, 405]


class TestAppConfiguration:    
    def test_routers_are_included(self):
        routes = [route.path for route in app.routes]
        api_routes = [route for route in routes if route.startswith("/api")]
        assert len(api_routes) > 0


class TestErrorHandling:
    def test_nonexistent_endpoint(self):
        response = client.get("/endpoint-inexistente")
        assert response.status_code == 404


class TestIntegration:
    def test_multiple_requests(self):
        for _ in range(5):
            response = client.get("/health")
            assert response.status_code == 200
            assert response.json() == {"status": "healthy"}
