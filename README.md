# Naveen's Tools

> [!WARNING]
> This project is under **active development** and may be unstable or incomplete. Features may change or break without notice.

A browser-based PDF utility suite where your files **never leave your device**. All document processing runs entirely client-side using [Pyodide](https://pyodide.org/) (Python via WebAssembly) and the [`pyodide-tools`](./pyodide-tools/) Python package bundled as a `.whl`.

**Live site:** [tools.naveenmk.me](https://tools.naveenmk.me)

## Features

- 📄 **Merge PDFs** — Combine multiple PDF files into one, with drag-and-drop reordering
- ✂️ **Split PDFs** — Extract pages or ranges from a PDF *(in progress)*
- 🔒 **100% client-side** — Files are processed in the browser; nothing is uploaded to a server
- 📱 **Mobile-friendly** — Responsive layout with touch-friendly drag-and-drop

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite |
| Routing | TanStack Router (file-based) |
| UI | Shadcn/ui + Tailwind CSS v4 |
| Python runtime | Pyodide (WASM) |
| PDF processing | `pypdf` via `pyodide-tools` wheel |
| Deployment | Cloudflare Pages |
| Package manager | pnpm |

## Project Structure

```
.
├── src/
│   ├── routes/           # TanStack Router file-based routes
│   │   ├── __root.tsx    # Root layout (nav, providers)
│   │   ├── index.tsx     # Homepage / tool listing
│   │   ├── merge.tsx     # PDF Merge page
│   │   └── split.tsx     # PDF Split page
│   └── components/ui/    # Shadcn UI primitives
├── pyodide-tools/        # Python package built into a .whl for Pyodide
├── public/               # Static assets (Pyodide .whl placed here at build time)
└── justfile              # Build automation
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- [uv](https://docs.astral.sh/uv/) — for building the Python wheel
- [just](https://github.com/casey/just) — task runner

### Development

```bash
# Install JS dependencies
pnpm install

# Build the pyodide-tools wheel and copy it to public/
just build-pyodide

# Start the dev server (http://localhost:3000)
pnpm run dev
```

### Production Build

```bash
# Build everything (pyodide wheel + Vite frontend)
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

## License

This project is licensed under the **GNU General Public License v3.0**. See [LICENSE](./LICENSE) for the full text.
