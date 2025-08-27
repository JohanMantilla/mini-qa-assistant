import pytest
from app.utils import text_utils

class TestTextUtils:

    def test_clean_text_basic(self):
        text = "Hola!!! ¿Cómo estás? \n Esto es una prueba."
        cleaned = text_utils.clean_text(text)
        assert "Hola" in cleaned
        assert "\n" not in cleaned
        assert "¿" in cleaned  # símbolos permitidos
        assert cleaned.startswith("Hola")

    def test_split_into_chunks_basic(self):
        text = "Esto es una oración. Esta es otra oración. Y otra más."
        chunks = text_utils.split_into_chunks(text, chunk_size=30, overlap=5)
        assert len(chunks) > 0
        for chunk in chunks:
            assert len(chunk) > 0

    def test_split_into_chunks_empty(self):
        chunks = text_utils.split_into_chunks("", chunk_size=30)
        assert chunks == []

    def test_extract_sentences_basic(self):
        text = "Primera oración. Segunda oración. Tercera oración. Cuarta oración."
        result = text_utils.extract_sentences(text, num_sentences=2)
        assert "Primera oración." in result
        assert "Segunda oración." in result
        assert "Tercera oración" not in result

    def test_extract_sentences_empty(self):
        result = text_utils.extract_sentences("", num_sentences=3)
        assert result == ""

    def test_extract_sentences_truncate_long(self):
        text = "a" * 500 + ". Segunda oración."
        result = text_utils.extract_sentences(text)
        assert len(result) <= 300
