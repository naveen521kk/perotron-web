import io
from typing import List, Dict, Any
from pypdf import PdfReader, PdfWriter

def get_pdf_info(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Get basic information about a PDF file.
    
    Args:
        pdf_bytes: The raw bytes of the PDF file.
        
    Returns:
        A dictionary containing PDF metadata (e.g., num_pages).
    """
    reader = PdfReader(io.BytesIO(pdf_bytes))
    return {
        "num_pages": len(reader.pages)
    }

def merge_pdfs(pdf_bytes_list: List[bytes]) -> bytes:
    """
    Merge multiple PDF files into one.
    
    Args:
        pdf_bytes_list: A list of raw bytes for each PDF file to merge, in order.
        
    Returns:
        The raw bytes of the merged PDF.
    """
    writer = PdfWriter()
    
    for pdf_bytes in pdf_bytes_list:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        writer.append(reader)
        
    output_stream = io.BytesIO()
    writer.write(output_stream)
    return output_stream.getvalue()

def split_pdf(pdf_bytes: bytes, pages: List[int]) -> bytes:
    """
    Extract specific pages from a PDF to create a new PDF.
    
    Args:
        pdf_bytes: The raw bytes of the original PDF.
        pages: A list of 0-indexed page numbers to extract.
        
    Returns:
        The raw bytes of the new PDF containing only the extracted pages.
    """
    reader = PdfReader(io.BytesIO(pdf_bytes))
    writer = PdfWriter()
    
    for page_num in pages:
        if 0 <= page_num < len(reader.pages):
            writer.add_page(reader.pages[page_num])
            
    output_stream = io.BytesIO()
    writer.write(output_stream)
    return output_stream.getvalue()
