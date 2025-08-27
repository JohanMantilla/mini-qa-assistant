import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.document_service import DocumentService

client = TestClient(app)

class TestRootAndHealth:
    def test_root(self):
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "endpoints" in data
        assert data["message"] == "Bienvenido al Mini Asistente Q&A"

    def test_health(self):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}

    def test_cors(self):
        response = client.options("/")
        assert response.status_code in [200, 405]


class TestSearchEndpoints:
    @pytest.fixture(autouse=True)
    def setup_service(self):
        self.service = DocumentService()
        self.service.clear_index()
        yield
        self.service.clear_index()

    def test_search_no_documents(self):
        response = client.get("/api/search?q=Python")
        assert response.status_code == 404
        assert "No hay documentos indexados" in response.json()["detail"]

    def test_search_empty_query(self):
        response = client.get("/api/search?q=")
        assert response.status_code == 422


class TestAskEndpoints:
    @pytest.fixture(autouse=True)
    def setup_service(self):
        self.service = DocumentService()
        self.service.clear_index()
        yield
        self.service.clear_index()

    def test_ask_no_documents(self):
        payload = {"question": "¿Qué es Python?"}
        response = client.post("/api/ask", json=payload)
        assert response.status_code == 404
        assert "No hay documentos indexados" in response.json()["detail"]

    def test_ask_empty_question(self):
        self.service.add_document("doc.txt", "Python es un lenguaje")
        self.service.build_index()
        payload = {"question": ""}
        response = client.post("/api/ask", json=payload)
        assert response.status_code == 422



