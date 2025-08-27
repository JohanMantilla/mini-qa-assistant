import pytest
from app.services.document_service import DocumentService

class TestDocumentServiceSimple:

    def setup_method(self):
        self.service = DocumentService()
        self.service.clear_index()

    def test_add_document_basic(self):
        self.service.add_document("doc1.txt", "Python es un lenguaje de programación")
        assert "doc1.txt" in self.service.documents
        assert len(self.service.chunks) > 0

    def test_answer_question_no_info(self):
        self.service.add_document("manual.txt", "Python es un lenguaje interpretado")
        self.service.build_index()
        answer, citations = self.service.answer_question("Java")
        assert "no encuentro" in answer.lower()
        assert len(citations) == 0

    def test_clear_index_basic(self):
        self.service.add_document("doc.txt", "contenido")
        self.service.build_index()
        self.service.clear_index()
        assert len(self.service.documents) == 0
        assert self.service.bm25 is None

    def test_get_document_count_and_names(self):
        self.service.add_document("doc1.txt", "contenido 1")
        self.service.add_document("doc2.txt", "contenido 2")
        assert self.service.get_document_count() == 2
        names = self.service.get_document_names()
        assert "doc1.txt" in names and "doc2.txt" in names
