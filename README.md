# Perotron Web

> **Privacy-first tools powered by WebAssembly.**

[![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-blue.svg)](./LICENSE)
[![Live Site](https://img.shields.io/badge/Live%20Site-tools.naveenmk.me-green)](https://tools.naveenmk.me)

> [!WARNING]
> This project is under **active development**. Features may change or break without notice.

Perotron Web is an open-source platform for browser-based utilities. Every tool runs entirely in your browser via [Pyodide](https://pyodide.org/) (Python compiled to WebAssembly) — **no file is ever uploaded to a server, and no account is required.**

---

## ✨ Features

| Tool | Description |
|---|---|
| 📄 **Merge PDF** | Combine multiple PDFs into one. Drag-and-drop to reorder pages before merging. |
| ✂️ **Split PDF** | Extract pages, split by fixed chunks, custom ranges, or file size. Downloads as a ZIP. |
| 🔳 **QR Code Generator** | Generate custom QR codes for URLs, WiFi, vCards, WhatsApp, and plain text. Style with custom colors, dot shapes, and logos. Export as PNG, JPEG, or SVG. |

**Platform guarantees:**
- 🔒 **Zero uploads** — All processing happens in your browser via WebAssembly
- 🆓 **Free & open source** — GNU AGPL v3 licensed, forever
- 📱 **Responsive** — Works on desktop and mobile

---

## 🏗️ Architecture

Perotron uses a two-layer architecture:

```
Browser
├── React SPA (TanStack Router + Shadcn UI)
│   └── Calls ▸ Web Worker
│                └── Loads Pyodide (Python/WASM runtime)
│                        └── Imports pyodide-tools (.whl)
│                                └── Uses pypdf for PDF operations
```

1. **Frontend (React + Vite)** — The UI layer. Handles file input, drag-and-drop, previews, and downloads.
2. **Web Worker** — Isolates the heavy Pyodide runtime off the main thread, keeping the UI responsive.
3. **`pyodide-tools`** — A small Python package (built as a `.whl` wheel) that wraps `pypdf` and exposes clean functions for merging, splitting, and inspecting PDFs. Served as a static asset and loaded at runtime by Pyodide.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Routing | TanStack Router (file-based) |
| UI Components | Shadcn/ui + Tailwind CSS v4 |
| Python Runtime | Pyodide (WASM) |
| PDF Processing | `pypdf` via `pyodide-tools` wheel |
| State Management | Zustand |
| Drag & Drop | dnd-kit |
| QR Codes | qr-code-styling |
| Deployment | Cloudflare Pages |
| Package Manager | pnpm |

---

## 📁 Project Structure

```
.
├── src/
│   ├── routes/               # TanStack Router file-based routes
│   │   ├── __root.tsx        # Root layout: nav, footer, global providers
│   │   ├── index.tsx         # Homepage — tool listing
│   │   ├── merge.tsx         # PDF Merge tool
│   │   ├── split.tsx         # PDF Split tool
│   │   └── qr-generator.tsx  # QR Code Generator tool
│   ├── components/
│   │   └── ui/               # Shadcn UI primitives (Button, Card, etc.)
│   ├── store/                # Zustand state stores (per tool)
│   └── lib/
│       └── pdf-worker.ts     # Web Worker bridge to Pyodide
├── pyodide-tools/            # Python package built into a .whl for Pyodide
│   └── src/pyodide_tools/
│       └── pdf.py            # merge, split, and page-extraction functions
├── public/                   # Static assets (Pyodide .whl served from here)
├── justfile                  # Build automation (build, clean, etc.)
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) — `npm install -g pnpm`
- [uv](https://docs.astral.sh/uv/) — for building the Python wheel
- [just](https://github.com/casey/just) — task runner

### Development

```bash
# 1. Install JS dependencies
pnpm install

# 2. Build the pyodide-tools Python wheel and copy it to public/
just build-pyodide

# 3. Start the dev server at http://localhost:3000
pnpm run dev
```

### Production Build

```bash
# Build everything: pyodide wheel + Vite frontend bundle
just build
```

### Other Commands

```bash
pnpm run lint        # Run ESLint
pnpm run typecheck   # TypeScript type check
pnpm run format      # Format with Prettier
pnpm run test        # Run tests with Vitest
just clean           # Remove built artifacts
```

---

## 🐍 `pyodide-tools` Python Package

The [`pyodide-tools`](./pyodide-tools/) directory contains the Python package that powers all PDF operations. It is built as a pure-Python wheel using [`uv`](https://docs.astral.sh/uv/) and loaded at runtime by Pyodide in the browser.

**Key functions in [`pdf.py`](./pyodide-tools/src/pyodide_tools/pdf.py):**

| Function | Description |
|---|---|
| `merge_pdfs(pdf_bytes_list)` | Merge a list of PDFs into one |
| `split_pdf(pdf_bytes, pages)` | Extract specific pages by 0-indexed list |
| `split_pdf_by_fixed_ranges(pdf_bytes, chunk_size)` | Split into equal-sized chunks |
| `split_pdf_by_ranges(pdf_bytes, ranges)` | Split by custom `{start, end}` range dicts |
| `split_pdf_by_pages(pdf_bytes, page_spec)` | Extract pages using a spec string like `"1,3-5,8"` |
| `split_pdf_by_size(pdf_bytes, max_size_bytes)` | Split so each file stays under a byte limit |
| `get_pdf_info(pdf_bytes)` | Read basic PDF metadata (e.g. page count) |

Multi-file split operations return a ZIP archive (`bytes`).

---

## 🤝 Contributing

Contributions are welcome! Since this is a platform meant to grow, there is lots of room to add new tools.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-new-tool`
3. Commit your changes: `git commit -m "feat: add my new tool"`
4. Push and open a Pull Request

Please keep the privacy-first principle intact — all data processing must stay client-side.

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0**.
See [LICENSE](./LICENSE) for the full text.

