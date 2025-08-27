import pytest
from fastapi import UploadFile
from app.utils import file_utils
import io

class TestFileUtils:

    @pytest.mark.asyncio
    async def test_extract_text_from_txt_file(self):
        content = b"Hola mundo\nEsta es una prueba"
        file = UploadFile(filename="test.txt", file=io.BytesIO(content))
        text = await file_utils.extract_text_from_file(file)
        assert "Hola mundo" in text
        assert "Esta es una prueba" in text

    @pytest.mark.asyncio
    async def test_extract_text_from_pdf_file(self):
        # PDF simple generado en bytes
        from reportlab.pdfgen import canvas
        import tempfile
        temp_pdf = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
        c = canvas.Canvas(temp_pdf.name)
        c.drawString(100, 750, "Texto de prueba PDF")
        c.save()
        temp_pdf.seek(0)
        with open(temp_pdf.name, "rb") as f:
            file = UploadFile(filename="test.pdf", file=io.BytesIO(f.read()))
            text = await file_utils.extract_text_from_file(file)
            assert "Texto de prueba PDF" in text

    def test_validate_file_extension(self):
        txt_file = UploadFile(filename="archivo.txt", file=io.BytesIO(b""))
        pdf_file = UploadFile(filename="archivo.pdf", file=io.BytesIO(b""))
        doc_file = UploadFile(filename="archivo.docx", file=io.BytesIO(b""))
        assert file_utils.validate_file(txt_file)
        assert file_utils.validate_file(pdf_file)
        assert not file_utils.validate_file(doc_file)

    def test_validate_file_size(self):
        small_file = UploadFile(filename="small.txt", file=io.BytesIO(b"a"*100))
        large_file = UploadFile(filename="large.txt", file=io.BytesIO(b"a"*15*1024*1024))
        small_file.size = 100
        large_file.size = 15*1024*1024
        assert file_utils.validate_file_size(small_file, max_size_mb=10)
        assert not file_utils.validate_file_size(large_file, max_size_mb=10)

    def test_validate_file_content_txt(self):
        content = b"Este es un texto"
        assert file_utils.validate_file_content(content, "archivo.txt")
        bad_content = b"\xff\xff"
        assert not file_utils.validate_file_content(bad_content, "archivo.txt")

    def test_validate_file_content_pdf(self):
        valid_pdf_header = b"%PDF-1.4 example content"
        invalid_pdf = b"Not a PDF"
        assert file_utils.validate_file_content(valid_pdf_header, "archivo.pdf")
        assert not file_utils.validate_file_content(invalid_pdf, "archivo.pdf")
