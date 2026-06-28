import io
import pytest
from pypdf import PdfWriter
from pyodide_tools import get_pdf_info, merge_pdfs, split_pdf

def create_dummy_pdf(text: str) -> bytes:
    writer = PdfWriter()
    page = writer.add_blank_page(width=200, height=200)
    output = io.BytesIO()
    writer.write(output)
    return output.getvalue()

@pytest.fixture
def dummy_pdfs():
    pdf1 = create_dummy_pdf("PDF 1")
    pdf2 = create_dummy_pdf("PDF 2")
    return pdf1, pdf2

def test_get_pdf_info(dummy_pdfs):
    pdf1, _ = dummy_pdfs
    info = get_pdf_info(pdf1)
    assert info["num_pages"] == 1

def test_merge_pdfs(dummy_pdfs):
    pdf1, pdf2 = dummy_pdfs
    merged = merge_pdfs([pdf1, pdf2])
    info_merged = get_pdf_info(merged)
    assert info_merged["num_pages"] == 2

def test_split_pdf(dummy_pdfs):
    pdf1, pdf2 = dummy_pdfs
    merged = merge_pdfs([pdf1, pdf2])
    
    # Extract only the 2nd page (index 1)
    split = split_pdf(merged, [1])
    info_split = get_pdf_info(split)
    assert info_split["num_pages"] == 1
