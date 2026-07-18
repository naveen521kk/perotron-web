import { createFileRoute } from "@tanstack/react-router"
import {
    Scissors,
    UploadCloud,
    Loader2,
    Download,
    Plus,
    Trash2,
    X,
    PanelLeft,
    FileText,
    ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { useSplitStore } from "@/store/split-store"
import type { SplitMode, SizeUnit } from "@/store/split-store"
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { usePostHog } from "@posthog/react"

/* ── Lazy-loaded components ─────────────────────────────────────── */

const FooterAdBanner = lazy(() =>
    import("@/components/ad-banner").then((m) => ({
        default: m.FooterAdBanner,
    }))
)
const AdBanner = lazy(() =>
    import("@/components/ad-banner").then((m) => ({ default: m.AdBanner }))
)
const PdfThumbnail = lazy(() =>
    import("@/components/pdf-thumbnail").then((mod) => ({
        default: mod.PdfThumbnail,
    }))
)

/* ── Route ──────────────────────────────────────────────────────── */

export const Route = createFileRoute("/pdf/split")({
    head: () => ({
        meta: [
            {
                title: "Split PDF — Extract Pages from PDF Free | Perotron Web",
            },
            {
                name: "description",
                content:
                    "Extract individual pages or split a large PDF into separate files — no uploads required. Your PDF stays in your browser and is never sent to a server.",
            },
            {
                property: "og:title",
                content:
                    "Split PDF — Extract Pages from PDF Free | Perotron Web",
            },
            {
                property: "og:description",
                content:
                    "Extract individual pages or split a large PDF into separate files — no uploads required. Your PDF stays in your browser and is never sent to a server.",
            },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
            {
                name: "twitter:title",
                content:
                    "Split PDF — Extract Pages from PDF Free | Perotron Web",
            },
            {
                name: "twitter:description",
                content:
                    "Extract individual pages or split a large PDF into separate files — no uploads required. Your PDF stays in your browser and is never sent to a server.",
            },
        ],
        links: [{ rel: "canonical", href: "https://tools.naveenmk.me/pdf/split" }],
    }),
    component: SplitPage,
})

/* ── Helpers ─────────────────────────────────────────────────────── */

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function acceptSinglePdf(fileList: FileList | null): File | null {
    if (!fileList) return null
    const files = Array.from(fileList).filter(
        (f) => f.type === "application/pdf"
    )
    return files[0] ?? null
}

/* ── Main page ───────────────────────────────────────────────────── */

type SplitStatus =
    | "idle"
    | "loading-info"
    | "loading"
    | "splitting"
    | "done"
    | "error"

function SplitPage() {
    const splitFile = useSplitStore((s) => s.splitFile)
    const setFile = useSplitStore((s) => s.setFile)
    const clear = useSplitStore((s) => s.clear)
    const splitMode = useSplitStore((s) => s.splitMode)
    const setSplitMode = useSplitStore((s) => s.setSplitMode)
    const rangeMode = useSplitStore((s) => s.rangeMode)
    const setRangeMode = useSplitStore((s) => s.setRangeMode)
    const fixedChunkSize = useSplitStore((s) => s.fixedChunkSize)
    const setFixedChunkSize = useSplitStore((s) => s.setFixedChunkSize)
    const customRanges = useSplitStore((s) => s.customRanges)
    const addCustomRange = useSplitStore((s) => s.addCustomRange)
    const removeCustomRange = useSplitStore((s) => s.removeCustomRange)
    const updateCustomRange = useSplitStore((s) => s.updateCustomRange)
    const pageSpec = useSplitStore((s) => s.pageSpec)
    const setPageSpec = useSplitStore((s) => s.setPageSpec)
    const maxSizeValue = useSplitStore((s) => s.maxSizeValue)
    const setMaxSizeValue = useSplitStore((s) => s.setMaxSizeValue)
    const sizeUnit = useSplitStore((s) => s.sizeUnit)
    const setSizeUnit = useSplitStore((s) => s.setSizeUnit)

    const posthog = usePostHog()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Worker + status
    const [splitStatus, setSplitStatus] = useState<SplitStatus>("idle")
    const [statusMessage, setStatusMessage] = useState("")
    const workerRef = useRef<Worker | null>(null)
    const opIdRef = useRef(0)

    // Mobile sidebar
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Initialise worker on mount
    useEffect(() => {
        const worker = new Worker(
            new URL("../../lib/pdf-worker.ts", import.meta.url),
            { type: "module" }
        )
        workerRef.current = worker

        const analyticsHandler = (e: MessageEvent) => {
            if (e.data?.type !== "analytics") return
            const { event, params } = e.data
            if (import.meta.env.PROD) {
                if (
                    typeof window !== "undefined" &&
                    typeof (window as Window & { gtag?: Function }).gtag ===
                        "function"
                ) {
                    ;(window as unknown as { gtag: Function }).gtag(
                        "event",
                        event,
                        params
                    )
                }
            }
            posthog?.capture(event, params)
        }
        worker.addEventListener("message", analyticsHandler)

        return () => {
            worker.terminate()
            workerRef.current = null
        }
    }, [posthog])

    /* ── File upload handler ── */
    const handleFile = useCallback(
        async (file: File) => {
            const worker = workerRef.current
            if (!worker) return

            const id = ++opIdRef.current
            setSplitStatus("loading-info")
            setStatusMessage("Reading PDF info…")

            try {
                const buffer = await file.arrayBuffer()

                const pageCount = await new Promise<number>(
                    (resolve, reject) => {
                        const handler = (e: MessageEvent) => {
                            const data = e.data
                            if (data.id !== id) return
                            if (data.type === "status") {
                                setStatusMessage(data.message)
                                return
                            }
                            worker.removeEventListener("message", handler)
                            if (data.type === "done-info")
                                resolve(data.numPages)
                            else if (data.type === "error")
                                reject(new Error(data.message))
                        }
                        worker.addEventListener("message", handler)
                        worker.postMessage({ type: "get-info", id, buffer })
                    }
                )

                setFile(file, pageCount)
                setSplitStatus("idle")
                toast.success(
                    `PDF loaded — ${pageCount} page${pageCount !== 1 ? "s" : ""}`
                )
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err)
                setSplitStatus("error")
                toast.error("Failed to read PDF", { description: msg })
                setTimeout(() => setSplitStatus("idle"), 3000)
            }
        },
        [setFile]
    )

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault()
            const file = acceptSinglePdf(e.dataTransfer.files)
            if (file) handleFile(file)
        },
        [handleFile]
    )

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = acceptSinglePdf(e.target.files)
        if (file) handleFile(file)
        e.target.value = ""
    }

    /* ── Split handler ── */
    const handleSplit = useCallback(async () => {
        const worker = workerRef.current
        if (!worker || !splitFile) return

        const id = ++opIdRef.current
        setSplitStatus("loading")
        setStatusMessage("Reading file…")

        try {
            const buffer = await splitFile.file.arrayBuffer()

            setSplitStatus("splitting")
            setStatusMessage("Splitting…")

            // Determine message to send
            let message: Record<string, unknown>
            let downloadName: string
            let downloadMime: string

            if (splitMode === "ranges") {
                if (rangeMode === "fixed") {
                    message = {
                        type: "split-fixed",
                        id,
                        buffer,
                        chunkSize: fixedChunkSize,
                    }
                    downloadName = "split.zip"
                    downloadMime = "application/zip"
                } else {
                    // Custom ranges
                    const ranges = customRanges
                        .map((r) => ({
                            start: parseInt(r.start, 10),
                            end: parseInt(r.end, 10),
                        }))
                        .filter(
                            (r) =>
                                !isNaN(r.start) &&
                                !isNaN(r.end) &&
                                r.start <= r.end
                        )
                    if (ranges.length === 0) {
                        toast.error("No valid ranges", {
                            description:
                                "Enter at least one valid range (start ≤ end).",
                        })
                        setSplitStatus("idle")
                        return
                    }
                    message = { type: "split-ranges", id, buffer, ranges }
                    downloadName = "split.zip"
                    downloadMime = "application/zip"
                }
            } else if (splitMode === "pages") {
                if (!pageSpec.trim()) {
                    toast.error("No pages specified", {
                        description: "Enter pages like 1,3-5,8",
                    })
                    setSplitStatus("idle")
                    return
                }
                message = {
                    type: "split-pages",
                    id,
                    buffer,
                    pageSpec: pageSpec.trim(),
                }
                downloadName = "extracted_pages.pdf"
                downloadMime = "application/pdf"
            } else {
                // Size mode
                const maxBytes =
                    sizeUnit === "MB"
                        ? maxSizeValue * 1024 * 1024
                        : maxSizeValue * 1024
                message = {
                    type: "split-size",
                    id,
                    buffer,
                    maxSizeBytes: maxBytes,
                }
                downloadName = "split.zip"
                downloadMime = "application/zip"
            }

            // Send to worker and wait for response
            const resultBuffer = await new Promise<ArrayBuffer>(
                (resolve, reject) => {
                    const handler = (e: MessageEvent) => {
                        const data = e.data
                        if (data.id !== id) return
                        if (data.type === "status") {
                            setStatusMessage(data.message)
                            return
                        }
                        worker.removeEventListener("message", handler)
                        if (data.type === "done") resolve(data.buffer)
                        else if (data.type === "error")
                            reject(new Error(data.message))
                    }
                    worker.addEventListener("message", handler)
                    worker.postMessage(message, [buffer])
                }
            )

            // Trigger download
            const blob = new Blob([resultBuffer], { type: downloadMime })
            const url = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = downloadName
            a.click()
            URL.revokeObjectURL(url)

            setSplitStatus("done")
            toast.success("PDF split successfully!")
            setTimeout(() => setSplitStatus("idle"), 3000)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err)
            setSplitStatus("error")
            toast.error("Split failed", { description: msg })
            setTimeout(() => setSplitStatus("idle"), 3000)
        }
    }, [
        splitFile,
        splitMode,
        rangeMode,
        fixedChunkSize,
        customRanges,
        pageSpec,
        maxSizeValue,
        sizeUnit,
    ])

    /* ── Split button content ── */
    const splitButtonContent = (
        <>
            {splitStatus === "loading" || splitStatus === "splitting" ? (
                <Loader2 className="size-4 animate-spin" />
            ) : splitStatus === "done" ? (
                <Download className="size-4" />
            ) : (
                <Scissors className="size-4" />
            )}
            {splitStatus === "loading"
                ? "Initialising…"
                : splitStatus === "splitting"
                  ? statusMessage
                  : splitStatus === "done"
                    ? "Done!"
                    : "Split PDF"}
        </>
    )

    const isBusy =
        splitStatus === "loading" ||
        splitStatus === "splitting" ||
        splitStatus === "loading-info"

    /* ── Preview helper text ── */
    const previewText = (() => {
        if (!splitFile) return ""
        const total = splitFile.pageCount

        if (splitMode === "ranges") {
            if (rangeMode === "fixed") {
                const count = Math.ceil(total / fixedChunkSize)
                return `Will produce ~${count} file${count !== 1 ? "s" : ""}`
            }
            const validRanges = customRanges.filter(
                (r) =>
                    r.start &&
                    r.end &&
                    !isNaN(+r.start) &&
                    !isNaN(+r.end) &&
                    +r.start <= +r.end
            )
            return validRanges.length > 0
                ? `${validRanges.length} range${validRanges.length !== 1 ? "s" : ""} defined`
                : "No valid ranges"
        }

        if (splitMode === "pages") {
            if (!pageSpec.trim()) return "No pages specified"
            // Quick parse to count
            const parts = pageSpec.split(",").filter((p) => p.trim())
            return `${parts.length} selection${parts.length !== 1 ? "s" : ""} specified`
        }

        if (splitMode === "size") {
            return `Each output ≤ ${maxSizeValue} ${sizeUnit}`
        }

        return ""
    })()

    /* ── Upload screen ── */
    if (!splitFile) {
        return (
            <>
                <div className="flex w-full flex-1 flex-col items-center px-4 py-16">
                    {/* Header */}
                    <div className="mx-auto mb-10 flex w-full max-w-2xl animate-in flex-col items-center gap-4 text-center duration-500 fade-in slide-in-from-bottom-4">
                        <div className="inline-flex size-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                            <Scissors className="size-7" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                            Split PDF
                        </h1>
                        <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
                            Upload a PDF and pull out the pages you need — as
                            individual files or a new document. Stays in your
                            browser.
                        </p>
                    </div>

                    {/* Drop zone */}
                    <div className="mx-auto w-full max-w-2xl animate-in delay-100 duration-700 fill-mode-both fade-in slide-in-from-bottom-6">
                        <label
                            htmlFor="split-file-upload"
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
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
                                        <span>Select a PDF file</span>
                                    </Button>
                                    <p className="text-sm text-muted-foreground">
                                        or drag and drop it here
                                    </p>
                                </div>
                            </div>

                            <input
                                ref={fileInputRef}
                                id="split-file-upload"
                                type="file"
                                className="hidden"
                                accept="application/pdf"
                                onChange={handleFileInputChange}
                            />
                        </label>
                    </div>

                    {/* Loading indicator */}
                    {splitStatus === "loading-info" && (
                        <div className="mt-6 flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" />
                            <p className="text-sm">{statusMessage}</p>
                        </div>
                    )}
                </div>
                <FooterAdBanner />
            </>
        )
    }

    /* ── Sidebar content (shared by desktop sidebar and mobile sheet) ── */
    const sidebarContent = (
        <>
            {/* File info */}
            <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                    Selected file
                </p>

                {/* Thumbnail */}
                <div className="flex justify-center rounded-lg border border-border bg-muted/30 p-3">
                    <Suspense
                        fallback={
                            <div className="aspect-[3/4] w-24 animate-pulse rounded-md bg-muted" />
                        }
                    >
                        <PdfThumbnail
                            file={splitFile.file}
                            width={96}
                            className="w-24"
                        />
                    </Suspense>
                </div>

                <div className="flex flex-col gap-0.5">
                    <p
                        className="truncate text-sm font-medium text-foreground"
                        title={splitFile.file.name}
                        data-testid="split-file-name"
                    >
                        {splitFile.file.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span data-testid="split-file-size">{formatBytes(splitFile.file.size)}</span>
                        <span>·</span>
                        <span data-testid="split-file-page-count">
                            {splitFile.pageCount} page
                            {splitFile.pageCount !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Split button */}
            <Button
                size="lg"
                className="w-full gap-2"
                disabled={isBusy}
                onClick={handleSplit}
                data-testid="split-btn"
            >
                {splitButtonContent}
            </Button>

            {/* Preview text */}
            {previewText && (
                <p className="text-center text-xs text-muted-foreground" data-testid="split-preview-text">
                    {previewText}
                </p>
            )}

            <Separator />

            {/* Change file */}
            <Button
                variant="secondary"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => {
                    fileInputRef.current?.click()
                }}
                data-testid="change-file-btn"
            >
                <FileText className="size-4" />
                Change file
            </Button>

            {/* Clear */}
            <div className="mt-auto">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                        clear()
                        setSidebarOpen(false)
                    }}
                    data-testid="clear-btn"
                >
                    <Trash2 className="size-4" />
                    Clear
                </Button>
            </div>
        </>
    )

    /* ── Configure screen ── */
    return (
        <div className="flex w-full flex-1">
            {/* Hidden file input for "Change file" */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="application/pdf"
                onChange={handleFileInputChange}
            />

            {/* ── Left sidebar (desktop) ── */}
            <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-card p-5 md:flex">
                {sidebarContent}
            </aside>

            {/* ── Mobile sidebar (Sheet) ── */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetContent
                    side="left"
                    className="flex w-72 flex-col gap-4 p-5"
                >
                    <SheetHeader>
                        <SheetTitle className="text-left text-sm font-semibold tracking-widest text-muted-foreground uppercase">
                            Split options
                        </SheetTitle>
                    </SheetHeader>
                    {sidebarContent}
                </SheetContent>
            </Sheet>

            {/* ── Main content area ── */}
            <div className="flex flex-1 flex-col p-4 md:p-6">
                {/* Toolbar */}
                <div className="mb-5 flex items-center justify-start gap-3">
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                        onClick={() => setSidebarOpen(true)}
                        aria-label="Open options"
                    >
                        <PanelLeft className="size-4" />
                    </Button>

                    <div className="flex flex-col gap-0.5">
                        <h1 className="text-xl font-semibold text-foreground" data-testid="configure-heading">
                            Configure Split
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Choose how to split your {splitFile.pageCount}-page
                            PDF
                        </p>
                    </div>
                </div>

                {/* ── Tabs ── */}
                <Tabs
                    value={splitMode}
                    onValueChange={(v) => setSplitMode(v as SplitMode)}
                    className="w-full max-w-2xl"
                >
                    <TabsList className="mb-6 grid w-full grid-cols-3" data-testid="split-tabs">
                        <TabsTrigger value="ranges" data-testid="split-tab-ranges">Ranges</TabsTrigger>
                        <TabsTrigger value="pages" data-testid="split-tab-pages">Pages</TabsTrigger>
                        <TabsTrigger value="size" data-testid="split-tab-size">Size</TabsTrigger>
                    </TabsList>

                    {/* ── Ranges tab ── */}
                    <TabsContent value="ranges" className="flex flex-col gap-6">
                        <RadioGroup
                            value={rangeMode}
                            onValueChange={(v) =>
                                setRangeMode(v as "fixed" | "custom")
                            }
                            className="flex gap-4"
                            data-testid="range-mode-radio"
                        >
                            <div className="flex items-center gap-2">
                                <RadioGroupItem
                                    value="fixed"
                                    id="range-fixed"
                                    data-testid="range-mode-fixed"
                                />
                                <Label htmlFor="range-fixed">Fixed</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem
                                    value="custom"
                                    id="range-custom"
                                    data-testid="range-mode-custom"
                                />
                                <Label htmlFor="range-custom">Custom</Label>
                            </div>
                        </RadioGroup>

                        {rangeMode === "fixed" ? (
                            <div className="flex flex-col gap-3">
                                <Label htmlFor="chunk-size">
                                    Pages per file
                                </Label>
                                <Input
                                    id="chunk-size"
                                    type="number"
                                    min={1}
                                    max={splitFile.pageCount}
                                    value={fixedChunkSize}
                                    onChange={(e) =>
                                        setFixedChunkSize(
                                            parseInt(e.target.value, 10) || 1
                                        )
                                    }
                                    className="max-w-40"
                                    data-testid="chunk-size-input"
                                />
                                <p className="text-sm text-muted-foreground">
                                    Split into groups of {fixedChunkSize} page
                                    {fixedChunkSize !== 1 ? "s" : ""} each.{" "}
                                    {previewText}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <p className="text-sm text-muted-foreground">
                                    Define page ranges (1-indexed, inclusive).
                                    Each range becomes a separate PDF.
                                </p>

                                <div className="flex flex-col gap-3" data-testid="custom-range-list">
                                    {customRanges.map((range, idx) => (
                                        <div
                                            key={range.id}
                                            className="flex items-center gap-2"
                                            data-testid="custom-range-row"
                                            data-index={idx}
                                        >
                                            <Input
                                                type="number"
                                                placeholder="Start"
                                                min={1}
                                                max={splitFile.pageCount}
                                                value={range.start}
                                                onChange={(e) =>
                                                    updateCustomRange(
                                                        range.id,
                                                        "start",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-24"
                                            />
                                            <span className="text-sm text-muted-foreground">
                                                to
                                            </span>
                                            <Input
                                                type="number"
                                                placeholder="End"
                                                min={1}
                                                max={splitFile.pageCount}
                                                value={range.end}
                                                onChange={(e) =>
                                                    updateCustomRange(
                                                        range.id,
                                                        "end",
                                                        e.target.value
                                                    )
                                                }
                                                className="w-24"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="shrink-0 text-muted-foreground hover:text-destructive"
                                                onClick={() =>
                                                    removeCustomRange(range.id)
                                                }
                                                disabled={
                                                    customRanges.length <= 1
                                                }
                                                data-testid="remove-range-btn"
                                            >
                                                <X className="size-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-fit gap-2"
                                    onClick={addCustomRange}
                                >
                                    <Plus className="size-4" />
                                    Add range
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    {/* ── Pages tab ── */}
                    <TabsContent value="pages" className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="page-spec">Pages to extract</Label>
                            <Input
                                id="page-spec"
                                type="text"
                                placeholder="e.g. 1,3-5,8"
                                value={pageSpec}
                                onChange={(e) => setPageSpec(e.target.value)}
                                className="max-w-xs"
                                data-testid="page-spec-input"
                            />
                            <p className="text-sm text-muted-foreground">
                                Enter comma-separated pages or ranges. Example:{" "}
                                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                                    1,3-5,8
                                </code>{" "}
                                extracts pages 1, 3, 4, 5, and 8.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Your PDF has{" "}
                                <span className="font-medium text-foreground">
                                    {splitFile.pageCount}
                                </span>{" "}
                                page{splitFile.pageCount !== 1 ? "s" : ""} (1–
                                {splitFile.pageCount}).
                            </p>
                        </div>
                    </TabsContent>

                    {/* ── Size tab ── */}
                    <TabsContent value="size" className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <Label htmlFor="max-size">Max file size</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="max-size"
                                    type="number"
                                    min={1}
                                    value={maxSizeValue}
                                    onChange={(e) =>
                                        setMaxSizeValue(
                                            parseFloat(e.target.value) || 1
                                        )
                                    }
                                    className="w-28"
                                    data-testid="max-size-input"
                                />
                                <Select
                                    value={sizeUnit}
                                    onValueChange={(v) =>
                                        setSizeUnit(v as SizeUnit)
                                    }
                                >
                                    <SelectTrigger className="w-20" data-testid="size-unit-select">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="KB">KB</SelectItem>
                                        <SelectItem value="MB">MB</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Each output file will be at most{" "}
                                <span className="font-medium text-foreground">
                                    {maxSizeValue} {sizeUnit}
                                </span>
                                . Pages are added greedily until the limit is
                                reached.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Current file size:{" "}
                                <span className="font-medium text-foreground">
                                    {formatBytes(splitFile.file.size)}
                                </span>
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Mobile: Split button at bottom of page */}
                <div className="mt-8 flex flex-col gap-4 md:hidden">
                    <Button
                        size="lg"
                        className="w-full gap-2"
                        disabled={isBusy}
                        onClick={handleSplit}
                    >
                        {splitButtonContent}
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        className="w-full gap-2"
                        onClick={() => {
                            clear()
                        }}
                    >
                        <ArrowLeft className="size-4" />
                        Upload different file
                    </Button>
                </div>
            </div>

            {/* ── Right sidebar ad (lg+ only) ── */}
            <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] h-full shrink-0 flex-col items-start gap-4 p-4 lg:flex lg:w-1/5 lg:max-w-lg xl:w-1/4 2xl:w-1/3">
                <AdBanner
                    slot="3456430201"
                    format="auto"
                    responsive="true"
                    className="w-full"
                />
            </aside>
        </div>
    )
}
