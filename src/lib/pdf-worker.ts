import { loadPyodide, type PyodideInterface } from "pyodide"

type MergeMessage = {
    type: "merge"
    id: number
    buffers: ArrayBufferLike[]
}

type SplitFixedMessage = {
    type: "split-fixed"
    id: number
    buffer: ArrayBufferLike
    chunkSize: number
}

type SplitRangesMessage = {
    type: "split-ranges"
    id: number
    buffer: ArrayBufferLike
    ranges: { start: number; end: number }[]
}

type SplitPagesMessage = {
    type: "split-pages"
    id: number
    buffer: ArrayBufferLike
    pageSpec: string
}

type SplitSizeMessage = {
    type: "split-size"
    id: number
    buffer: ArrayBufferLike
    maxSizeBytes: number
}

type GetInfoMessage = {
    type: "get-info"
    id: number
    buffer: ArrayBufferLike
}

type WorkerMessage =
    | MergeMessage
    | SplitFixedMessage
    | SplitRangesMessage
    | SplitPagesMessage
    | SplitSizeMessage
    | GetInfoMessage

type AnalyticsParams = Record<string, string | number | boolean>

type WorkerResponse =
    | { type: "ready" }
    | { type: "done"; id: number; buffer: ArrayBufferLike }
    | { type: "done-info"; id: number; numPages: number }
    | { type: "error"; id: number; message: string }
    | { type: "status"; id: number; message: string }
    | { type: "analytics"; event: string; params: AnalyticsParams }

// Helpers
const log = (...args: unknown[]) => console.log("[pdf-worker]", ...args)
const warn = (...args: unknown[]) => console.warn("[pdf-worker]", ...args)
const error = (...args: unknown[]) => console.error("[pdf-worker]", ...args)

function postAnalytics(event: string, params: AnalyticsParams = {}) {
    const response: WorkerResponse = { type: "analytics", event, params }
    self.postMessage(response)
}

// Pyodide is loaded once and reused across requests
let pyodidePromise: Promise<PyodideInterface> | null = null

function getPyodide(): Promise<PyodideInterface> {
    if (!pyodidePromise) {
        pyodidePromise = (async () => {
            log("Starting Pyodide initialisation…")
            const t0 = performance.now()

            const pyodide = await loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v314.0.1/full/",
            })
            log(
                "Pyodide runtime loaded in",
                (performance.now() - t0).toFixed(0),
                "ms"
            )

            log("Loading micropip…")
            await pyodide.loadPackage("micropip")
            log("micropip loaded")

            const micropip = pyodide.pyimport("micropip")
            log("Installing pyodide_tools wheel…")
            await micropip.install("/pyodide_tools-0.1.0-py3-none-any.whl")

            const totalMs = performance.now() - t0
            log(
                "pyodide_tools installed — total init time:",
                totalMs.toFixed(0),
                "ms"
            )

            postAnalytics("pyodide_init_complete", {
                duration_ms: Math.round(totalMs),
            })

            return pyodide
        })()
    }
    return pyodidePromise
}

// Kick off loading immediately so the first operation is faster
log("Worker spawned — beginning eager Pyodide load")
getPyodide()
    .then(() => {
        log("Pyodide ready — worker is hot")
        const response: WorkerResponse = { type: "ready" }
        self.postMessage(response)
    })
    .catch((err) => {
        error("Failed to initialise Pyodide:", err)
        postAnalytics("pyodide_init_error", {
            error_message: err instanceof Error ? err.message : String(err),
        })
    })

/* ── Handler helpers ─────────────────────────────────────────────── */

const post = (msg: WorkerResponse) => self.postMessage(msg)

async function handleMerge(id: number, buffers: ArrayBufferLike[]) {
    const fileCount = buffers.length
    log(`[merge:${id}] Starting merge of ${fileCount} file(s)`)
    const mergeStart = performance.now()

    post({ type: "status", id, message: "Initialising Pyodide…" })
    const pyodide = await getPyodide()

    post({ type: "status", id, message: "Merging PDFs…" })

    const pyBuffers = pyodide.toPy(buffers.map((b) => new Uint8Array(b)))
    const pythonStart = performance.now()

    const resultProxy = await pyodide.runPythonAsync(
        `
from pyodide_tools.pdf import merge_pdfs
merge_pdfs(list(pdf_buffers))
`,
        { globals: pyodide.toPy({ pdf_buffers: pyBuffers }) }
    )

    const pythonMs = performance.now() - pythonStart
    log(
        `[merge:${id}] Python merge_pdfs() completed in ${pythonMs.toFixed(0)} ms`
    )

    const resultUint8: Uint8Array = resultProxy.toJs()
    resultProxy.destroy()

    const resultBuffer = resultUint8.buffer
    const totalMs = performance.now() - mergeStart
    const outputKb = Math.round(resultUint8.byteLength / 1024)

    log(
        `[merge:${id}] Done — output size: ${outputKb} KB, total time: ${totalMs.toFixed(0)} ms`
    )

    postAnalytics("pdf_merge_complete", {
        file_count: fileCount,
        output_size_kb: outputKb,
        python_duration_ms: Math.round(pythonMs),
        total_duration_ms: Math.round(totalMs),
    })

    const response: WorkerResponse = { type: "done", id, buffer: resultBuffer }
    self.postMessage(response, { transfer: [resultBuffer] })
}

async function handleGetInfo(id: number, buffer: ArrayBufferLike) {
    log(`[get-info:${id}] Getting PDF info`)

    post({ type: "status", id, message: "Initialising Pyodide…" })
    const pyodide = await getPyodide()

    post({ type: "status", id, message: "Reading PDF…" })

    const pyBuffer = pyodide.toPy(new Uint8Array(buffer))
    const resultProxy = await pyodide.runPythonAsync(
        `
from pyodide_tools.pdf import get_pdf_info
get_pdf_info(bytes(pdf_buffer))
`,
        { globals: pyodide.toPy({ pdf_buffer: pyBuffer }) }
    )

    const info = resultProxy.toJs() as { num_pages: number | undefined }
    resultProxy.destroy()

    const numPages = info.num_pages ?? 0
    log(`[get-info:${id}] PDF has ${numPages} pages`)

    const response: WorkerResponse = { type: "done-info", id, numPages }
    self.postMessage(response)
}

async function handleSplitFixed(
    id: number,
    buffer: ArrayBufferLike,
    chunkSize: number
) {
    log(`[split-fixed:${id}] Splitting with chunk size ${chunkSize}`)
    const t0 = performance.now()

    post({ type: "status", id, message: "Initialising Pyodide…" })
    const pyodide = await getPyodide()

    post({ type: "status", id, message: "Splitting PDF…" })

    const pyBuffer = pyodide.toPy(new Uint8Array(buffer))
    const pythonStart = performance.now()

    const resultProxy = await pyodide.runPythonAsync(
        `
from pyodide_tools.pdf import split_pdf_by_fixed_ranges
split_pdf_by_fixed_ranges(bytes(pdf_buffer), chunk_size)
`,
        {
            globals: pyodide.toPy({
                pdf_buffer: pyBuffer,
                chunk_size: chunkSize,
            }),
        }
    )
    const pythonMs = performance.now() - pythonStart
    log(`[split-fixed:${id}] Python completed in ${pythonMs.toFixed(0)} ms`)

    const resultUint8: Uint8Array = resultProxy.toJs()
    resultProxy.destroy()

    const resultBuffer = resultUint8.buffer
    const totalMs = performance.now() - t0

    postAnalytics("pdf_split_fixed_complete", {
        chunk_size: chunkSize,
        output_size_kb: Math.round(resultUint8.byteLength / 1024),
        python_duration_ms: Math.round(pythonMs),
        total_duration_ms: Math.round(totalMs),
    })

    const response: WorkerResponse = { type: "done", id, buffer: resultBuffer }
    self.postMessage(response, { transfer: [resultBuffer] })
}

async function handleSplitRanges(
    id: number,
    buffer: ArrayBufferLike,
    ranges: { start: number; end: number }[]
) {
    log(`[split-ranges:${id}] Splitting with ${ranges.length} range(s)`)
    const t0 = performance.now()

    post({ type: "status", id, message: "Initialising Pyodide…" })
    const pyodide = await getPyodide()

    post({ type: "status", id, message: "Splitting PDF…" })

    const pyBuffer = pyodide.toPy(new Uint8Array(buffer))
    const pyRanges = pyodide.toPy(ranges)
    const pythonStart = performance.now()

    const resultProxy = await pyodide.runPythonAsync(
        `
from pyodide_tools.pdf import split_pdf_by_ranges
split_pdf_by_ranges(bytes(pdf_buffer), list(ranges))
`,
        { globals: pyodide.toPy({ pdf_buffer: pyBuffer, ranges: pyRanges }) }
    )

    const pythonMs = performance.now() - pythonStart
    log(`[split-ranges:${id}] Python completed in ${pythonMs.toFixed(0)} ms`)

    const resultUint8: Uint8Array = resultProxy.toJs()
    resultProxy.destroy()

    const resultBuffer = resultUint8.buffer
    const totalMs = performance.now() - t0

    postAnalytics("pdf_split_ranges_complete", {
        range_count: ranges.length,
        output_size_kb: Math.round(resultUint8.byteLength / 1024),
        python_duration_ms: Math.round(pythonMs),
        total_duration_ms: Math.round(totalMs),
    })

    const response: WorkerResponse = { type: "done", id, buffer: resultBuffer }
    self.postMessage(response, { transfer: [resultBuffer] })
}

async function handleSplitPages(
    id: number,
    buffer: ArrayBufferLike,
    pageSpec: string
) {
    log(`[split-pages:${id}] Splitting with spec: ${pageSpec}`)
    const t0 = performance.now()

    post({ type: "status", id, message: "Initialising Pyodide…" })
    const pyodide = await getPyodide()

    post({ type: "status", id, message: "Extracting pages…" })

    const pyBuffer = pyodide.toPy(new Uint8Array(buffer))
    const pythonStart = performance.now()

    const resultProxy = await pyodide.runPythonAsync(
        `
from pyodide_tools.pdf import split_pdf_by_pages
split_pdf_by_pages(bytes(pdf_buffer), page_spec)
`,
        { globals: pyodide.toPy({ pdf_buffer: pyBuffer, page_spec: pageSpec }) }
    )

    const pythonMs = performance.now() - pythonStart
    log(`[split-pages:${id}] Python completed in ${pythonMs.toFixed(0)} ms`)

    const resultUint8: Uint8Array = resultProxy.toJs()
    resultProxy.destroy()

    const resultBuffer = resultUint8.buffer
    const totalMs = performance.now() - t0

    postAnalytics("pdf_split_pages_complete", {
        page_spec: pageSpec,
        output_size_kb: Math.round(resultUint8.byteLength / 1024),
        python_duration_ms: Math.round(pythonMs),
        total_duration_ms: Math.round(totalMs),
    })

    const response: WorkerResponse = { type: "done", id, buffer: resultBuffer }
    self.postMessage(response, { transfer: [resultBuffer] })
}

async function handleSplitSize(
    id: number,
    buffer: ArrayBufferLike,
    maxSizeBytes: number
) {
    log(`[split-size:${id}] Splitting with max size ${maxSizeBytes} bytes`)
    const t0 = performance.now()

    post({ type: "status", id, message: "Initialising Pyodide…" })
    const pyodide = await getPyodide()

    post({ type: "status", id, message: "Splitting by size…" })

    const pyBuffer = pyodide.toPy(new Uint8Array(buffer))
    const pythonStart = performance.now()

    const resultProxy = await pyodide.runPythonAsync(
        `
from pyodide_tools.pdf import split_pdf_by_size
split_pdf_by_size(bytes(pdf_buffer), max_size_bytes)
`,
        {
            globals: pyodide.toPy({
                pdf_buffer: pyBuffer,
                max_size_bytes: maxSizeBytes,
            }),
        }
    )

    const pythonMs = performance.now() - pythonStart
    log(`[split-size:${id}] Python completed in ${pythonMs.toFixed(0)} ms`)

    const resultUint8: Uint8Array = resultProxy.toJs()
    resultProxy.destroy()

    const resultBuffer = resultUint8.buffer
    const totalMs = performance.now() - t0

    postAnalytics("pdf_split_size_complete", {
        max_size_bytes: maxSizeBytes,
        output_size_kb: Math.round(resultUint8.byteLength / 1024),
        python_duration_ms: Math.round(pythonMs),
        total_duration_ms: Math.round(totalMs),
    })

    const response: WorkerResponse = { type: "done", id, buffer: resultBuffer }
    self.postMessage(response, { transfer: [resultBuffer] })
}

/* ── Message router ──────────────────────────────────────────────── */

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
    const { type, id } = event.data

    try {
        switch (type) {
            case "merge":
                await handleMerge(id, (event.data as MergeMessage).buffers)
                break
            case "get-info":
                await handleGetInfo(id, (event.data as GetInfoMessage).buffer)
                break
            case "split-fixed":
                await handleSplitFixed(
                    id,
                    (event.data as SplitFixedMessage).buffer,
                    (event.data as SplitFixedMessage).chunkSize
                )
                break
            case "split-ranges":
                await handleSplitRanges(
                    id,
                    (event.data as SplitRangesMessage).buffer,
                    (event.data as SplitRangesMessage).ranges
                )
                break
            case "split-pages":
                await handleSplitPages(
                    id,
                    (event.data as SplitPagesMessage).buffer,
                    (event.data as SplitPagesMessage).pageSpec
                )
                break
            case "split-size":
                await handleSplitSize(
                    id,
                    (event.data as SplitSizeMessage).buffer,
                    (event.data as SplitSizeMessage).maxSizeBytes
                )
                break
            default:
                warn("Received unknown message type:", type)
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        error(`[${type}:${id}] Failed:`, message)

        postAnalytics(`pdf_${type.replace("-", "_")}_error`, {
            error_message: message,
        })

        const response: WorkerResponse = { type: "error", id, message }
        self.postMessage(response)
    }
}
