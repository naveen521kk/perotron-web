import io
import zipfile
from importlib.metadata import version, PackageNotFoundError
from typing import List, Dict, Any

from pypdf import PdfReader, PdfWriter

try:
    __version__ = version("pyodide-tools")
except PackageNotFoundError:
    __version__ = "unknown"

_TOOL_NAME = f"Perotron Web {__version__}"


def _set_pdf_metadata(writer: PdfWriter) -> None:
    """Stamp Creator/Producer metadata on an output PDF."""
    writer.add_metadata(
        {
            "/Creator": _TOOL_NAME,
            "/Producer": _TOOL_NAME,
        }
    )


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

    _set_pdf_metadata(writer)
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

    _set_pdf_metadata(writer)
    output_stream = io.BytesIO()
    writer.write(output_stream)
    return output_stream.getvalue()


# ── Helpers ─────────────────────────────────────────────────────────


def _write_pdf_for_pages(reader: PdfReader, page_indices: List[int]) -> bytes:
    """Write a PDF containing the specified 0-indexed pages."""
    writer = PdfWriter()
    for idx in page_indices:
        if 0 <= idx < len(reader.pages):
            writer.add_page(reader.pages[idx])
    _set_pdf_metadata(writer)
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


def _bundle_as_zip(pdf_chunks: List[bytes], base_name: str = "split") -> bytes:
    """Bundle multiple PDF byte-strings into a single ZIP archive."""
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for i, chunk in enumerate(pdf_chunks, start=1):
            zf.writestr(f"{base_name}_{i}.pdf", chunk)
    return buf.getvalue()


def _parse_page_spec(spec: str, num_pages: int) -> List[int]:
    """
    Parse a page specification string like "1,3-5,8" into 0-indexed page numbers.

    Supports:
      - Individual pages: "1,3,5"
      - Ranges: "2-5"
      - Mixed: "1,3-5,8"

    Invalid / out-of-range entries are silently skipped.
    Returns a deduplicated, sorted list of 0-indexed page numbers.
    """
    pages: set[int] = set()
    for part in spec.split(","):
        part = part.strip()
        if not part:
            continue
        if "-" in part:
            tokens = part.split("-", 1)
            try:
                start = int(tokens[0].strip())
                end = int(tokens[1].strip())
            except ValueError:
                continue
            for p in range(start, end + 1):
                if 1 <= p <= num_pages:
                    pages.add(p - 1)
        else:
            try:
                p = int(part)
            except ValueError:
                continue
            if 1 <= p <= num_pages:
                pages.add(p - 1)
    return sorted(pages)


# ── Public split functions ──────────────────────────────────────────


def split_pdf_by_fixed_ranges(pdf_bytes: bytes, chunk_size: int) -> bytes:
    """
    Split a PDF into fixed-size chunks.

    Args:
        pdf_bytes: The raw bytes of the PDF.
        chunk_size: Number of pages per output file (≥ 1).

    Returns:
        ZIP archive bytes containing split_1.pdf, split_2.pdf, etc.
    """
    if chunk_size < 1:
        chunk_size = 1

    reader = PdfReader(io.BytesIO(pdf_bytes))
    total = len(reader.pages)
    chunks: List[bytes] = []

    for start in range(0, total, chunk_size):
        end = min(start + chunk_size, total)
        page_indices = list(range(start, end))
        chunks.append(_write_pdf_for_pages(reader, page_indices))

    return _bundle_as_zip(chunks)


def split_pdf_by_ranges(pdf_bytes: bytes, ranges: List[Dict[str, int]]) -> bytes:
    """
    Split a PDF by custom page ranges.

    Args:
        pdf_bytes: The raw bytes of the PDF.
        ranges: A list of {"start": int, "end": int} dicts.
                Pages are 1-indexed and inclusive on both ends.

    Returns:
        ZIP archive bytes containing split_1.pdf, split_2.pdf, etc.
    """
    reader = PdfReader(io.BytesIO(pdf_bytes))
    total = len(reader.pages)
    chunks: List[bytes] = []

    for r in ranges:
        start = max(1, r.get("start", 1)) - 1          # convert to 0-indexed
        end = min(r.get("end", total), total)            # keep 1-indexed then range()
        page_indices = list(range(start, end))
        if page_indices:
            chunks.append(_write_pdf_for_pages(reader, page_indices))

    if not chunks:
        raise ValueError("No valid page ranges provided.")

    return _bundle_as_zip(chunks)


def split_pdf_by_pages(pdf_bytes: bytes, page_spec: str) -> bytes:
    """
    Extract specific pages from a PDF using a human-readable spec string.

    Args:
        pdf_bytes: The raw bytes of the PDF.
        page_spec: Comma-separated page spec, e.g. "1,3-5,8" (1-indexed).

    Returns:
        The raw bytes of a single PDF containing only the selected pages.
    """
    reader = PdfReader(io.BytesIO(pdf_bytes))
    total = len(reader.pages)
    page_indices = _parse_page_spec(page_spec, total)

    if not page_indices:
        raise ValueError(f"No valid pages found in spec: {page_spec!r}")

    return _write_pdf_for_pages(reader, page_indices)


def split_pdf_by_size(pdf_bytes: bytes, max_size_bytes: int) -> bytes:
    """
    Split a PDF so that each output file is ≤ max_size_bytes.

    Uses a greedy algorithm: adds pages one-by-one and flushes
    when appending the next page would exceed the limit.
    A single page that exceeds the limit is emitted alone.

    Args:
        pdf_bytes: The raw bytes of the PDF.
        max_size_bytes: Maximum size in bytes per output file.

    Returns:
        ZIP archive bytes containing split_1.pdf, split_2.pdf, etc.
    """
    if max_size_bytes < 1024:
        max_size_bytes = 1024  # floor at 1 KB

    reader = PdfReader(io.BytesIO(pdf_bytes))
    total = len(reader.pages)
    chunks: List[bytes] = []
    current_pages: List[int] = []

    for idx in range(total):
        candidate = current_pages + [idx]
        candidate_bytes = _write_pdf_for_pages(reader, candidate)

        if len(candidate_bytes) > max_size_bytes and current_pages:
            # Flush current chunk, start a new one with this page
            chunks.append(_write_pdf_for_pages(reader, current_pages))
            current_pages = [idx]
        else:
            current_pages = candidate

    # Flush remaining
    if current_pages:
        chunks.append(_write_pdf_for_pages(reader, current_pages))

    return _bundle_as_zip(chunks)
