# Agent Learnings & Project Structure

This document serves as a reference for agents and developers working on "Naveen's Tools". It outlines the core tech stack, the established code structure, and the critical design patterns to follow.

## Project Context
- **Name:** Naveen's Tools - PDF Utilities
- **Goal:** Provide browser-based PDF utilities (like Merge and Split) where files never leave the user's device. Processing is intended to happen entirely client-side (with PyOdide/WASM planned for the future).
- **Project Idea / Vision:** The platform is a Single Page Application (SPA) built with TanStack Router and Shadcn UI, designed to host various web tools. The initial focus is on browser-based PDF utilities (Merging, Splitting). The UI takes strong inspiration from iLovePDF, featuring a prominent, single large button/dropzone to upload or drag-and-drop PDF files. A basic homepage introduces the available tools and links to them. Future development will integrate PyOdide to run Python libraries like `pypdf` directly in the browser, ensuring all document operations remain client-side.
- **Tech Stack:** 
  - React + Vite
  - TanStack Router (File-based routing)
  - Shadcn UI + Tailwind CSS (v4)
  - pnpm (Package Manager)

## General Code Structure
- `src/routes/` - Contains the application routes managed by TanStack Router.
  - `__root.tsx`: The root layout containing shared UI like navigation bars and global providers.
  - `index.tsx`: The landing page listing the available tools.
  - `merge.tsx`, `split.tsx`: Dedicated pages for each PDF utility containing drag-and-drop file upload interfaces.
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

## Package Management
- Always use `pnpm` for installing dependencies.
- Use `pnpm dlx shadcn@latest add <component>` to add new UI components to the project.
