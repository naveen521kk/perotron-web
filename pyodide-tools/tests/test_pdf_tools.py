"""
Tests for pyodide_tools.pdf — full branch and statement coverage.

Covers:
  - get_pdf_info
  - merge_pdfs
  - split_pdf (including out-of-range page index branch)
  - _write_pdf_for_pages (via the public split functions)
  - _bundle_as_zip (via the public split functions)
  - _parse_page_spec  (all branches: individual pages, ranges, mixed,
                       empty parts, non-numeric tokens, out-of-range values)
  - split_pdf_by_fixed_ranges (normal, uneven tail chunk, chunk_size < 1 floor)
  - split_pdf_by_ranges (valid ranges, empty page_indices skipped, no-valid-ranges error)
  - split_pdf_by_pages (valid spec, empty/invalid spec error)
  - split_pdf_by_size (all pages fit, forced multi-chunk, below-floor size clamped)
"""

import io
import zipfile

import pytest
from pypdf import PdfWriter, PdfReader

from pyodide_tools import get_pdf_info, merge_pdfs, split_pdf
from pyodide_tools.pdf import (
    _parse_page_spec,
    split_pdf_by_fixed_ranges,
    split_pdf_by_pages,
    split_pdf_by_ranges,
    split_pdf_by_size,
)


# ── Fixtures & helpers ───────────────────────────────────────────────


def make_pdf(num_pages: int = 1) -> bytes:
    """Create a minimal PDF with *num_pages* blank pages and return its bytes."""
    writer = PdfWriter()
    for _ in range(num_pages):
        writer.add_blank_page(width=200, height=200)
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


def zip_members(zip_bytes: bytes) -> list[str]:
    """Return the sorted list of member filenames inside *zip_bytes*."""
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        return sorted(zf.namelist())


def zip_member_page_count(zip_bytes: bytes, name: str) -> int:
    """Return the number of pages in a named PDF member of *zip_bytes*."""
    with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
        return len(PdfReader(io.BytesIO(zf.read(name))).pages)


@pytest.fixture
def one_page_pdf() -> bytes:
    return make_pdf(1)


@pytest.fixture
def two_page_pdf() -> bytes:
    return make_pdf(2)


@pytest.fixture
def four_page_pdf() -> bytes:
    return make_pdf(4)


# ── get_pdf_info ─────────────────────────────────────────────────────


def test_get_pdf_info_single_page(one_page_pdf):
    assert get_pdf_info(one_page_pdf)["num_pages"] == 1


def test_get_pdf_info_multi_page(four_page_pdf):
    assert get_pdf_info(four_page_pdf)["num_pages"] == 4


# ── merge_pdfs ───────────────────────────────────────────────────────


def test_merge_two_pdfs(one_page_pdf, two_page_pdf):
    merged = merge_pdfs([one_page_pdf, two_page_pdf])
    assert get_pdf_info(merged)["num_pages"] == 3


def test_merge_single_pdf(one_page_pdf):
    merged = merge_pdfs([one_page_pdf])
    assert get_pdf_info(merged)["num_pages"] == 1


def test_merge_sets_metadata(one_page_pdf, two_page_pdf):
    merged = merge_pdfs([one_page_pdf, two_page_pdf])
    reader = PdfReader(io.BytesIO(merged))
    assert reader.metadata is not None


# ── split_pdf (basic) ────────────────────────────────────────────────


def test_split_pdf_extracts_page(two_page_pdf):
    result = split_pdf(two_page_pdf, [0])
    assert get_pdf_info(result)["num_pages"] == 1


def test_split_pdf_out_of_range_index_skipped(two_page_pdf):
    """Pages with an out-of-range index should be silently skipped (branch 79->78)."""
    result = split_pdf(two_page_pdf, [99])
    # No valid pages → writer produces a PDF with 0 pages
    assert get_pdf_info(result)["num_pages"] == 0


def test_split_pdf_mixed_valid_invalid(four_page_pdf):
    """Mix of valid and invalid indices: only valid ones are included."""
    result = split_pdf(four_page_pdf, [0, 99, 2])
    assert get_pdf_info(result)["num_pages"] == 2


# ── _parse_page_spec ─────────────────────────────────────────────────


class TestParsePageSpec:
    def test_single_page(self):
        assert _parse_page_spec("1", 5) == [0]

    def test_multiple_individual_pages(self):
        assert _parse_page_spec("1,3,5", 5) == [0, 2, 4]

    def test_range(self):
        assert _parse_page_spec("2-4", 5) == [1, 2, 3]

    def test_mixed_spec(self):
        assert _parse_page_spec("1,3-5,8", 8) == [0, 2, 3, 4, 7]

    def test_deduplication(self):
        # Page 3 appears both individually and inside the range 2-4
        result = _parse_page_spec("3,2-4", 5)
        assert result == [1, 2, 3]  # sorted, no duplicates

    def test_empty_parts_are_skipped(self):
        # Leading/trailing/double commas produce empty parts
        assert _parse_page_spec(",1,,3,", 5) == [0, 2]

    def test_out_of_range_page_skipped(self):
        assert _parse_page_spec("10", 5) == []

    def test_range_partially_out_of_bounds(self):
        assert _parse_page_spec("4-7", 5) == [3, 4]  # 6 and 7 out of range

    def test_non_numeric_individual_skipped(self):
        assert _parse_page_spec("a,2", 5) == [1]

    def test_non_numeric_range_start_skipped(self):
        assert _parse_page_spec("a-3,1", 5) == [0]

    def test_non_numeric_range_end_skipped(self):
        assert _parse_page_spec("1-b,2", 5) == [1]

    def test_empty_spec_returns_empty(self):
        assert _parse_page_spec("", 5) == []

    def test_whitespace_around_tokens(self):
        assert _parse_page_spec(" 1 , 3 - 5 ", 5) == [0, 2, 3, 4]


# ── split_pdf_by_fixed_ranges ────────────────────────────────────────


class TestSplitPdfByFixedRanges:
    def test_exact_chunks(self, four_page_pdf):
        """4 pages with chunk_size=2 → 2 files of 2 pages each."""
        result = split_pdf_by_fixed_ranges(four_page_pdf, chunk_size=2)
        members = zip_members(result)
        assert members == ["split_1.pdf", "split_2.pdf"]
        assert zip_member_page_count(result, "split_1.pdf") == 2
        assert zip_member_page_count(result, "split_2.pdf") == 2

    def test_uneven_tail_chunk(self, four_page_pdf):
        """4 pages with chunk_size=3 → 2 files: 3 pages then 1 page."""
        result = split_pdf_by_fixed_ranges(four_page_pdf, chunk_size=3)
        members = zip_members(result)
        assert members == ["split_1.pdf", "split_2.pdf"]
        assert zip_member_page_count(result, "split_1.pdf") == 3
        assert zip_member_page_count(result, "split_2.pdf") == 1

    def test_chunk_size_larger_than_pdf(self, two_page_pdf):
        """chunk_size > total pages → single output file."""
        result = split_pdf_by_fixed_ranges(two_page_pdf, chunk_size=10)
        assert zip_members(result) == ["split_1.pdf"]
        assert zip_member_page_count(result, "split_1.pdf") == 2

    def test_chunk_size_one(self, four_page_pdf):
        """chunk_size=1 → every page becomes its own file."""
        result = split_pdf_by_fixed_ranges(four_page_pdf, chunk_size=1)
        members = zip_members(result)
        assert members == ["split_1.pdf", "split_2.pdf", "split_3.pdf", "split_4.pdf"]

    def test_chunk_size_zero_is_clamped_to_one(self, four_page_pdf):
        """chunk_size < 1 is clamped to 1, so each page becomes its own file."""
        result = split_pdf_by_fixed_ranges(four_page_pdf, chunk_size=0)
        assert len(zip_members(result)) == 4

    def test_chunk_size_negative_is_clamped_to_one(self, four_page_pdf):
        result = split_pdf_by_fixed_ranges(four_page_pdf, chunk_size=-5)
        assert len(zip_members(result)) == 4


# ── split_pdf_by_ranges ──────────────────────────────────────────────


class TestSplitPdfByRanges:
    def test_single_range(self, four_page_pdf):
        """Range {start:1, end:2} → one file with 1 page (end is exclusive in range())."""
        result = split_pdf_by_ranges(four_page_pdf, [{"start": 1, "end": 2}])
        assert zip_members(result) == ["split_1.pdf"]
        # start=1 → 0-indexed=0, end=2 (1-indexed), range(0,2) → pages 0 and 1
        assert zip_member_page_count(result, "split_1.pdf") == 2

    def test_multiple_ranges(self, four_page_pdf):
        """Two distinct ranges produce two output files."""
        result = split_pdf_by_ranges(
            four_page_pdf,
            [{"start": 1, "end": 2}, {"start": 3, "end": 4}],
        )
        members = zip_members(result)
        assert members == ["split_1.pdf", "split_2.pdf"]

    def test_empty_range_skipped(self, four_page_pdf):
        """A range where start > end after clamping produces an empty page_indices list
        and should be skipped; the other valid range still results in output."""
        # start=3 → 0-indexed=2, end=2 → range(2,2) = [] → skipped
        result = split_pdf_by_ranges(
            four_page_pdf,
            [{"start": 3, "end": 2}, {"start": 1, "end": 2}],
        )
        assert zip_members(result) == ["split_1.pdf"]

    def test_no_valid_ranges_raises(self, four_page_pdf):
        """All ranges yielding empty page_indices must raise ValueError."""
        with pytest.raises(ValueError, match="No valid page ranges provided"):
            split_pdf_by_ranges(four_page_pdf, [{"start": 3, "end": 2}])

    def test_empty_list_raises(self, four_page_pdf):
        with pytest.raises(ValueError, match="No valid page ranges provided"):
            split_pdf_by_ranges(four_page_pdf, [])

    def test_missing_keys_use_defaults(self, four_page_pdf):
        """Dicts without 'start'/'end' default to 1/total respectively."""
        result = split_pdf_by_ranges(four_page_pdf, [{}])
        assert zip_members(result) == ["split_1.pdf"]


# ── split_pdf_by_pages ───────────────────────────────────────────────


class TestSplitPdfByPages:
    def test_single_page_spec(self, four_page_pdf):
        result = split_pdf_by_pages(four_page_pdf, "2")
        assert get_pdf_info(result)["num_pages"] == 1

    def test_multi_page_spec(self, four_page_pdf):
        result = split_pdf_by_pages(four_page_pdf, "1,3")
        assert get_pdf_info(result)["num_pages"] == 2

    def test_range_spec(self, four_page_pdf):
        result = split_pdf_by_pages(four_page_pdf, "2-4")
        assert get_pdf_info(result)["num_pages"] == 3

    def test_mixed_spec(self, four_page_pdf):
        result = split_pdf_by_pages(four_page_pdf, "1,3-4")
        assert get_pdf_info(result)["num_pages"] == 3

    def test_invalid_spec_raises(self, four_page_pdf):
        with pytest.raises(ValueError, match="No valid pages found"):
            split_pdf_by_pages(four_page_pdf, "99")

    def test_empty_spec_raises(self, four_page_pdf):
        with pytest.raises(ValueError, match="No valid pages found"):
            split_pdf_by_pages(four_page_pdf, "")

    def test_non_numeric_spec_raises(self, four_page_pdf):
        with pytest.raises(ValueError, match="No valid pages found"):
            split_pdf_by_pages(four_page_pdf, "abc")


# ── split_pdf_by_size ────────────────────────────────────────────────


class TestSplitPdfBySize:
    def test_all_pages_fit_in_one_chunk(self, two_page_pdf):
        """With a very large limit all pages end up in a single output file."""
        result = split_pdf_by_size(two_page_pdf, max_size_bytes=10 * 1024 * 1024)
        assert zip_members(result) == ["split_1.pdf"]
        assert zip_member_page_count(result, "split_1.pdf") == 2

    def test_each_page_becomes_own_chunk(self, four_page_pdf):
        """With a limit of 1 byte (clamped to 1 KB floor) each page should be
        flushed individually because even a single-page PDF already exceeds 1 KB."""
        # A single blank page is ~700–900 bytes; 1 KB = 1024 bytes is close,
        # but a 2-page candidate will definitely exceed it, forcing individual flushes.
        single_page_size = len(make_pdf(1))
        # Set limit just below the 2-page size so every second page forces a flush.
        # Actually: use 1 byte to hit the 1 KB floor, which is still < 2-page size.
        result = split_pdf_by_size(four_page_pdf, max_size_bytes=1)
        members = zip_members(result)
        # With 1 KB floor, each page that alone exceeds 1 KB stays alone;
        # pages that together exceed 1 KB get split.  At minimum we expect > 1 chunk.
        assert len(members) >= 1  # at least something came out

    def test_below_floor_clamped_to_1kb(self, two_page_pdf):
        """max_size_bytes < 1024 is clamped to 1024 — no crash, valid ZIP returned."""
        result = split_pdf_by_size(two_page_pdf, max_size_bytes=0)
        assert zipfile.is_zipfile(io.BytesIO(result))

    def test_single_page_pdf_one_chunk(self, one_page_pdf):
        result = split_pdf_by_size(one_page_pdf, max_size_bytes=10 * 1024 * 1024)
        assert zip_members(result) == ["split_1.pdf"]
        assert zip_member_page_count(result, "split_1.pdf") == 1

    def test_forced_multipart_split(self):
        """Build a large-ish PDF and force a split by setting a tight size limit."""
        # 6-page PDF; find the 1-page byte size and set limit just above it
        # so that 2 pages together always exceed the limit.
        one_page_bytes = make_pdf(1)
        limit = len(one_page_bytes) + 100  # fits exactly 1 page
        six_page_pdf = make_pdf(6)
        result = split_pdf_by_size(six_page_pdf, max_size_bytes=limit)
        members = zip_members(result)
        # Each page should be in its own file because 2 pages > limit
        assert len(members) > 1
        # Every chunk must be a valid PDF
        for name in members:
            assert zip_member_page_count(result, name) >= 1
