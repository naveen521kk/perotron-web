import { createFileRoute } from "@tanstack/react-router"
import {
    FileStack,
    UploadCloud,
    Merge,
    ArrowUpDown,
    SortAsc,
    SortDesc,
    Weight,
    Plus,
    Trash2,
    GripVertical,
    X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useMergeStore } from "@/store/merge-store"
import { lazy, Suspense, useCallback, useRef, useState } from "react"
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
    DragOverlay,
} from "@dnd-kit/core"
import {
    SortableContext,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { PdfFile } from "@/store/merge-store"

/* ── Route ──────────────────────────────────────────────────────── */

const PdfThumbnail = lazy(() =>
    import("@/components/pdf-thumbnail").then((mod) => ({
        default: mod.PdfThumbnail,
    }))
)

export const Route = createFileRoute("/merge")({
    head: () => ({
        meta: [
            {
                title: "Merge PDF — Combine PDFs Free Online | Naveen's Tools",
            },
            {
                name: "description",
                content:
                    "Combine multiple PDF files into one document instantly. Arrange pages in any order and download the merged PDF — everything stays in your browser, nothing is uploaded.",
            },
            {
                property: "og:title",
                content:
                    "Merge PDF — Combine PDFs Free Online | Naveen's Tools",
            },
            {
                property: "og:description",
                content:
                    "Combine multiple PDF files into one document instantly. Arrange pages in any order and download the merged PDF — everything stays in your browser, nothing is uploaded.",
            },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
            {
                name: "twitter:title",
                content:
                    "Merge PDF — Combine PDFs Free Online | Naveen's Tools",
            },
            {
                name: "twitter:description",
                content:
                    "Combine multiple PDF files into one document instantly. Arrange pages in any order and download the merged PDF — everything stays in your browser, nothing is uploaded.",
            },
        ],
        links: [
            { rel: "canonical", href: "https://tools.naveenmk.me/merge" },
        ],
    }),
    component: MergePage,
})

/* ── Helpers ─────────────────────────────────────────────────────── */

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function acceptPdfFiles(fileList: FileList | null): File[] {
    if (!fileList) return []
    return Array.from(fileList).filter((f) => f.type === "application/pdf")
}

/* ── Sortable card ───────────────────────────────────────────────── */

function SortablePdfCard({
    pdfFile,
    index,
    overlay = false,
}: {
    pdfFile: PdfFile
    index: number
    overlay?: boolean
}) {
    const removeFile = useMergeStore((s) => s.removeFile)
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: pdfFile.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={overlay ? {} : style}
            {...attributes}
            {...listeners}
            className={`group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow duration-200 ${overlay ? "rotate-2 cursor-grabbing shadow-2xl ring-2 ring-primary/40" : "cursor-grab hover:shadow-md active:cursor-grabbing"}`}
        >
            {/* Drag handle (visual indicator only) */}
            {/* <div
                className="absolute top-2 left-2 z-10 flex size-7 items-center justify-center rounded-md bg-background/80 text-muted-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
            >
                <GripVertical className="size-4" />
            </div> */}

            {/* Remove button */}
            {!overlay && (
                <Button
                    onClick={() => removeFile(pdfFile.id)}
                    className="absolute top-2 right-2 z-10 flex size-7 cursor-pointer items-center justify-center rounded-md bg-background/80 text-muted-foreground opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100"
                    variant="outline"
                    size="icon"
                    aria-label="Remove file"
                >
                    <X className="size-3.5" />
                </Button>
            )}

            {/* Order badge */}
            <div className="absolute top-2 left-2 z-10 rounded-md bg-primary px-2 py-1 text-[10px] font-bold tabular-nums text-primary-foreground">
                {index + 1}
            </div>

            {/* Thumbnail */}
            <div className="bg-muted/30 p-2 flex items-center justify-center">
                <Suspense
                    fallback={
                        <div className="aspect-[3/4] w-full animate-pulse rounded-md bg-muted" />
                    }
                >
                    <PdfThumbnail file={pdfFile.file} width={180} className="w-full" />
                </Suspense>
            </div>

            {/* File info */}
            <div className="flex flex-col gap-0.5 p-2">
                <p
                    className="truncate text-xs font-medium text-foreground"
                    title={pdfFile.file.name}
                >
                    {pdfFile.file.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                    {formatBytes(pdfFile.file.size)}
                </p>
            </div>
        </div>
    )
}

/* ── Drop zone overlay (inside arrange area) ─────────────────────── */

function ArrangeDropZone({ onFiles }: { onFiles: (files: File[]) => void }) {
    const [draggingOver, setDraggingOver] = useState(false)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        // Only trigger if it's a file drag, not a dnd-kit reorder
        if (e.dataTransfer.types.includes("Files")) {
            setDraggingOver(true)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDraggingOver(false)
        const files = acceptPdfFiles(e.dataTransfer.files)
        if (files.length) onFiles(files)
    }

    if (!draggingOver) return null

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={() => setDraggingOver(false)}
            onDrop={handleDrop}
            className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm"
        >
            <div className="flex size-20 items-center justify-center rounded-full border-4 border-primary bg-primary/10 text-primary">
                <UploadCloud className="size-9" />
            </div>
            <p className="text-xl font-semibold text-foreground">Drop PDFs to add them</p>
        </div>
    )
}

/* ── Main page ───────────────────────────────────────────────────── */

function MergePage() {
    const files = useMergeStore((s) => s.files)
    const addFiles = useMergeStore((s) => s.addFiles)
    const reorderFiles = useMergeStore((s) => s.reorderFiles)
    const sortByName = useMergeStore((s) => s.sortByName)
    const sortBySize = useMergeStore((s) => s.sortBySize)
    const clearAll = useMergeStore((s) => s.clearAll)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const addMoreInputRef = useRef<HTMLInputElement>(null)

    // dnd-kit state
    const [activeId, setActiveId] = useState<string | null>(null)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
    )

    // Sort direction toggle state
    const [nameSortDir, setNameSortDir] = useState<"asc" | "desc">("asc")
    const [sizeSortDir, setSizeSortDir] = useState<"asc" | "desc">("asc")
    const [lastSort, setLastSort] = useState<"name" | "size" | null>(null)

    const handleSortByName = () => {
        const nextDir = lastSort === "name" && nameSortDir === "asc" ? "desc" : "asc"
        setNameSortDir(nextDir)
        setLastSort("name")
        sortByName(nextDir)
    }

    const handleSortBySize = () => {
        const nextDir = lastSort === "size" && sizeSortDir === "asc" ? "desc" : "asc"
        setSizeSortDir(nextDir)
        setLastSort("size")
        sortBySize(nextDir)
    }

    // Whether we're detecting a native file drag-over the arrange grid
    const [nativeDragOver, setNativeDragOver] = useState(false)

    const activeFile = activeId ? files.find((f) => f.id === activeId) : null
    const activeIndex = activeId ? files.findIndex((f) => f.id === activeId) : -1

    /* handlers */
    const handleInitialDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            const picked = acceptPdfFiles(e.dataTransfer.files)
            if (picked.length) addFiles(picked)
        },
        [addFiles]
    )

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log({e})
        const picked = acceptPdfFiles(e.target.files)
        if (picked.length) addFiles(picked)
        e.target.value = ""
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)
        if (!over || active.id === over.id) return
        const fromIndex = files.findIndex((f) => f.id === active.id)
        const toIndex = files.findIndex((f) => f.id === over.id)
        if (fromIndex !== -1 && toIndex !== -1) reorderFiles(fromIndex, toIndex)
    }

    const hasFiles = files.length > 0

    /* ── Upload screen ── */
    if (!hasFiles) {
        return (
            <div className="flex w-full flex-1 flex-col items-center px-4 py-16">
                {/* Header */}
                <div className="mx-auto mb-10 flex w-full max-w-2xl animate-in flex-col items-center gap-4 text-center duration-500 fade-in slide-in-from-bottom-4">
                    <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                        <FileStack className="size-7" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                        Merge PDFs
                    </h1>
                    <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
                        Drop your files below. Arrange them in the order you want, then
                        download the merged result. Nothing is uploaded.
                    </p>
                </div>

                {/* Drop zone */}
                <div className="mx-auto w-full max-w-2xl animate-in delay-100 duration-700 fill-mode-both fade-in slide-in-from-bottom-6">
                    <label
                        htmlFor="merge-file-upload"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleInitialDrop}
                        className="group relative flex h-80 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-card transition-all duration-300 hover:border-primary/50 hover:bg-accent/30"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                        <div className="relative z-10 flex flex-col items-center gap-6 transition-transform duration-500 group-hover:-translate-y-1">
                            <div className="relative">
                                <div className="absolute -inset-3 rounded-full bg-primary/15 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
                                <div className="flex size-20 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg">
                                    <UploadCloud className="size-9" />
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <Button
                                    asChild
                                    size="lg"
                                    className="rounded-full px-8 shadow-md"
                                >
                                    <span>Select PDF files</span>
                                </Button>
                                <p className="text-sm text-muted-foreground">
                                    or drag and drop them here
                                </p>
                            </div>
                        </div>

                        <input
                            ref={fileInputRef}
                            id="merge-file-upload"
                            type="file"
                            className="hidden"
                            multiple
                            accept="application/pdf"
                            onChange={handleFileInputChange}
                        />
                    </label>
                </div>
            </div>
        )
    }

    /* ── Arrange screen ── */
    return (
        <div
            className="flex w-full flex-1"
            onDragOver={(e) => {
                if (e.dataTransfer.types.includes("Files")) {
                    e.preventDefault()
                    setNativeDragOver(true)
                }
            }}
            onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setNativeDragOver(false)
                }
            }}
            onDrop={(e) => {
                e.preventDefault()
                setNativeDragOver(false)
                const picked = acceptPdfFiles(e.dataTransfer.files)
                if (picked.length) addFiles(picked)
            }}
        >
            {/* Native drag overlay */}
            {nativeDragOver && (
                <div className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm">
                    <div className="flex size-20 items-center justify-center rounded-full border-4 border-primary bg-primary/10 text-primary">
                        <Plus className="size-9" />
                    </div>
                    <p className="text-xl font-semibold text-foreground">
                        Drop PDFs to add them
                    </p>
                </div>
            )}

            {/* Hidden extra file input */}
            <input
                ref={addMoreInputRef}
                type="file"
                className="hidden"
                multiple
                accept="application/pdf"
                onChange={handleFileInputChange}
            />

            {/* ── Left sidebar ── */}
            <aside className="sticky top-14 flex h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col gap-4 border-r border-border bg-card p-5">
                {/* File count */}
                <div className="flex flex-col gap-1">
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Files to merge
                    </p>
                    <p className="text-3xl font-bold text-foreground">{files.length}</p>
                    <p className="text-xs text-muted-foreground">
                        {files.reduce((s, f) => s + f.file.size, 0) > 0
                            ? formatBytes(files.reduce((s, f) => s + f.file.size, 0))
                            : "—"}{" "}
                        total
                    </p>
                </div>

                <Separator />

                {/* Merge button */}
                <Button
                    size="lg"
                    className="w-full gap-2 rounded-xl"
                    onClick={() => {
                        // Merge functionality will be implemented later
                    }}
                >
                    <Merge className="size-4" />
                    Merge PDFs
                </Button>

                <Separator />

                {/* Sort options */}
                <div className="flex flex-col gap-2">
                    <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                        Sort
                    </p>
                    <Button
                        variant={lastSort === "name" ? "secondary" : "outline"}
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={handleSortByName}
                    >
                        {lastSort === "name" && nameSortDir === "desc" ? (
                            <SortDesc className="size-4" />
                        ) : (
                            <SortAsc className="size-4" />
                        )}
                        By filename
                    </Button>
                    <Button
                        variant={lastSort === "size" ? "secondary" : "outline"}
                        size="sm"
                        className="w-full justify-start gap-2"
                        onClick={handleSortBySize}
                    >
                        {lastSort === "size" && sizeSortDir === "desc" ? (
                            <SortDesc className="size-4" />
                        ) : (
                            <SortAsc className="size-4" />
                        )}
                        By file size
                    </Button>
                </div>

                <Separator />

                {/* Add more */}
                <Button
                    variant="secondary"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => addMoreInputRef.current?.click()}
                >
                    <Plus className="size-4" />
                    Add more PDFs
                </Button>

                {/* Clear all — push to bottom */}
                <div className="mt-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
                        onClick={clearAll}
                    >
                        <Trash2 className="size-4" />
                        Clear all
                    </Button>
                </div>
            </aside>

            {/* ── Arrange grid ── */}
            <div className="flex flex-1 flex-col p-6">
                {/* Toolbar */}
                <div className="mb-5 flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                        <h1 className="text-xl font-semibold text-foreground">
                            Arrange PDFs
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Drag cards to reorder · Drop new PDFs anywhere to add them
                        </p>
                    </div>
                </div>

                {/* Drag-and-drop grid */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={(event: DragStartEvent) =>
                        setActiveId(event.active.id as string)
                    }
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={files.map((f) => f.id)}
                        strategy={rectSortingStrategy}
                    >
                        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
                            {files.map((pf, index) => (
                                <SortablePdfCard
                                    key={pf.id}
                                    pdfFile={pf}
                                    index={index}
                                />
                            ))}
                        </div>
                    </SortableContext>

                    {/* Drag overlay (ghost card while dragging) */}
                    <DragOverlay>
                        {activeFile ? (
                            <SortablePdfCard
                                pdfFile={activeFile}
                                index={activeIndex}
                                overlay
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    )
}
