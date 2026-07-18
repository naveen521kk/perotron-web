# Agent Learnings & Project Structure

This document serves as a reference for agents and developers working on "Perotron Web". It outlines the core tech stack, the established code structure, and the critical design patterns to follow.

## Project Context
- **Name:** Perotron Web
- **Goal:** A privacy-first, open-source tools platform where all data processing happens locally in the browser — no server, nothing uploaded. Built for the long term to host many different tools needed by people.
- **License:** GNU AGPL v3 (fully open source)
- **Tagline:** "Privacy-first tools powered by WebAssembly."
- **Project Idea / Vision:** The platform is a Single Page Application (SPA) built with TanStack Router and Shadcn UI, designed to host a wide variety of browser-based web tools. The initial focus is on PDF utilities (Merging, Splitting) and a QR Code Generator. Future development will expand to many more tools. All processing runs client-side via WebAssembly (PyOdide/WASM), ensuring user data never leaves the device.
- **Tech Stack:** 
  - React + Vite
  - TanStack Router (File-based routing)
  - Shadcn UI + Tailwind CSS (v4)
  - pnpm (Package Manager)

## General Code Structure
- `src/routes/` - Contains the application routes managed by TanStack Router.
  - `__root.tsx`: The root layout containing shared UI like navigation bars and global providers.
  - `index.tsx`: The landing page listing all available tools.
  - `pdf/index.tsx`: Category landing page listing PDF tools.
  - `pdf/merge.tsx`, `pdf/split.tsx`: Dedicated pages for each PDF utility containing drag-and-drop file upload interfaces.
  - `qr/index.tsx`: Category landing page listing QR tools.
  - `qr/generator.tsx`: QR Code Generator page.
- `src/components/ui/` - Contains the Shadcn UI component primitives (e.g., `button.tsx`, `card.tsx`, `badge.tsx`, `separator.tsx`). These are installed via the `shadcn` CLI and should not be modified manually unless necessary.
- `src/lib/utils.ts` - Shared utility functions, typically including the `cn()` merge function for Tailwind classes.

## Design & Styling Guidelines (Learnings)
When modifying or extending the UI, the following rules must be strictly adhered to:
1. **Strictly Shadcn Theme:** Do not use hardcoded utility colors like `bg-blue-500`, `text-neutral-900`, or raw CSS gradients unless specifically requested. Use the semantic theme tokens defined by Shadcn (e.g., `bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`, `bg-card`, `border-border`).
2. **Component Usage:** Instead of creating custom HTML structures for interactive and structural elements, use the appropriate Shadcn components. 
   - Example: Use `<Button>` instead of `<span className="px-8 py-4 bg-neutral-900 rounded-full...">`.
   - Example: Use `<Card>`, `<CardHeader>`, `<CardTitle>`, and `<CardDescription>` instead of manually styling `<div>` blocks for containers.
   - Example: Use `<Badge>` for small pills or tags.
3. **Icons:** The project uses `lucide-react` for iconography. When scaling icons, prefer `size-*` over `w-* h-*`.
4. **Spacing:** Avoid `space-y-*` or `space-x-*`. Instead, use standard flexbox layout wrappers like `flex flex-col gap-*`.

## SEO Guidelines
- **Canonical URLs:** Every route must declare a `rel="canonical"` link tag in its `head()` function pointing to the production URL (`https://tools.naveenmk.me`). Add it inside a `links` array alongside any other link tags:
  ```ts
  head: () => ({
      meta: [ /* ... */ ],
      links: [
          { rel: "canonical", href: "https://tools.naveenmk.me/<path>" },
      ],
  })
  ```
- The root domain is `https://tools.naveenmk.me`. Current canonical mappings:
  - `/` → `https://tools.naveenmk.me/`
  - `/pdf` → `https://tools.naveenmk.me/pdf`
  - `/pdf/merge` → `https://tools.naveenmk.me/pdf/merge`
  - `/pdf/split` → `https://tools.naveenmk.me/pdf/split`
  - `/qr` → `https://tools.naveenmk.me/qr`
  - `/qr/generator` → `https://tools.naveenmk.me/qr/generator`
- When adding a new route, always include its canonical URL following the same pattern.
- When adding a new tool category, create a directory under `src/routes/` with an `index.tsx` for the category landing page.

## Package Management
- Always use `pnpm` for installing dependencies.
- Use `pnpm dlx shadcn@latest add <component>` to add new UI components to the project.

## E2E Testing Guidelines
E2E tests are written using **Playwright** and live in the `e2e/` directory at the project root.

- **Mandatory coverage:** Every new feature, tool, or route addition **must** be accompanied by corresponding E2E tests. This is non-negotiable.
- **File naming:** Name test files after the feature/route they cover (e.g., `pdf-merge.spec.ts`, `qr-generator.spec.ts`).
- **Test structure:** Group tests using `test.describe` blocks — at minimum, separate `Page load`, `Valid scenarios`, and `Invalid / Error scenarios` groups.
- **Helpers:** Shared navigation helpers and fixture paths live in `e2e/helpers/`. Add reusable helpers there instead of duplicating logic across spec files.
- **Fixtures:** Test fixture files (sample PDFs, images, etc.) live in `e2e/fixtures/`. Add any new fixture files needed for tests there.
- **`data-testid` attributes:** When a test needs to target a specific UI element, add a `data-testid` attribute to the component in the source code rather than relying on fragile CSS selectors or text matching alone.
- **Timeouts:** WASM/PyOdide operations can be slow. Set `test.setTimeout(120_000)` on any test that waits for file processing to complete, and use `{ timeout: 60_000 }` on the relevant `expect` assertions.
- **Running tests:** Use `pnpm run e2e` for headless runs or `pnpm run e2e:ui` for the interactive Playwright UI.
