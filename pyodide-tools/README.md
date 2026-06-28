# pyodide-tools

> [!WARNING]
> This project is **under active development** and may not work correctly in all cases. Expect breaking changes and incomplete features.

A Python package that provides browser-based PDF utilities for [Naveen's Tools](https://tools.naveenmk.me). It is designed to be compiled into a Python wheel and loaded at runtime via [Pyodide](https://pyodide.org/), allowing all PDF processing to happen entirely **client-side** — your files never leave your browser.

## Features

- **Merge PDFs** — Combine multiple PDF files into a single document, preserving page order.
- **Split PDFs** — Extract specific pages from a PDF into a new file.
- **PDF Info** — Retrieve basic metadata (e.g., page count) from a PDF file.

## How It Works

This package is built as a standard Python wheel using [`uv`](https://github.com/astral-sh/uv). The wheel is bundled into the frontend app's public assets directory. At runtime, the frontend loads Pyodide in a Web Worker and installs the wheel via `micropip`, exposing these utilities to the JavaScript layer with zero server involvement.

## API

All functions operate on raw `bytes` objects, making them compatible with the binary data exchanged between JavaScript (via Pyodide) and Python.

### `get_pdf_info(pdf_bytes: bytes) -> dict`

Returns basic metadata about a PDF.

```python
info = get_pdf_info(pdf_bytes)
# {"num_pages": 5}
```

### `merge_pdfs(pdf_bytes_list: list[bytes]) -> bytes`

Merges a list of PDFs into a single PDF, in the order they are provided.

```python
merged = merge_pdfs([pdf1_bytes, pdf2_bytes, pdf3_bytes])
```

### `split_pdf(pdf_bytes: bytes, pages: list[int]) -> bytes`

Extracts a subset of pages (0-indexed) from a PDF into a new PDF.

```python
# Extract the 1st and 3rd pages
result = split_pdf(pdf_bytes, [0, 2])
```

## Development

This package uses `uv` for dependency management and building.

**Prerequisites:** Python 3.13+, [`uv`](https://docs.astral.sh/uv/)

```bash
# Install dependencies
uv sync

# Run tests
uv run pytest

# Build the wheel
uv build
```

The built wheel (`.whl`) is placed in the `dist/` directory and should be copied to the frontend's `public/` assets directory as part of the main project build step (see the root `justfile`).

## License

This project is licensed under the [GNU General Public License v3.0](https://www.gnu.org/licenses/gpl-3.0.html).

Copyright © 2026 Naveen M K
