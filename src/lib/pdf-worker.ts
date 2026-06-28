import { loadPyodide, type PyodideInterface } from "pyodide"

type MergeMessage = {
    type: "merge"
    id: number
    buffers: ArrayBufferLike[]
}

type AnalyticsParams = Record<string, string | number | boolean>

type WorkerResponse =
    | { type: "ready" }
    | { type: "done"; id: number; buffer: ArrayBufferLike }
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
            log("Pyodide runtime loaded in", (performance.now() - t0).toFixed(0), "ms")

            log("Loading micropip…")
            await pyodide.loadPackage("micropip")
            log("micropip loaded")

            const micropip = pyodide.pyimport("micropip")
            log("Installing pyodide_tools wheel…")
            await micropip.install("/pyodide_tools-0.1.0-py3-none-any.whl")

            const totalMs = performance.now() - t0
            log("pyodide_tools installed — total init time:", totalMs.toFixed(0), "ms")

            postAnalytics("pyodide_init_complete", {
                duration_ms: Math.round(totalMs),
            })

            return pyodide
        })()
    }
    return pyodidePromise
}

// Kick off loading immediately so the first merge is faster
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

self.onmessage = async (event: MessageEvent<MergeMessage>) => {
    const { type, id, buffers } = event.data

    if (type !== "merge") {
        warn("Received unknown message type:", type)
        return
    }

    const fileCount = buffers.length
    log(`[merge:${id}] Starting merge of ${fileCount} file(s)`)
    const mergeStart = performance.now()

    try {
        const post = (msg: WorkerResponse) => self.postMessage(msg)

        post({ type: "status", id, message: "Initialising Pyodide…" })
        log(`[merge:${id}] Waiting for Pyodide…`)
        const pyodide = await getPyodide()
        log(`[merge:${id}] Pyodide ready, beginning Python execution`)

        post({ type: "status", id, message: "Merging PDFs…" })

        // Transfer the ArrayBuffers into the Python environment as a list of bytes
        const pyBuffers = pyodide.toPy(buffers.map((b) => new Uint8Array(b)))

        log(`[merge:${id}] Calling merge_pdfs() with ${fileCount} buffer(s)`)
        const pythonStart = performance.now()

        const resultProxy = await pyodide.runPythonAsync(
            `
from pyodide_tools.pdf import merge_pdfs
merge_pdfs(list(pdf_buffers))
`,
            { globals: pyodide.toPy({ pdf_buffers: pyBuffers }) }
        )

        const pythonMs = performance.now() - pythonStart
        log(`[merge:${id}] Python merge_pdfs() completed in ${pythonMs.toFixed(0)} ms`)

        // Convert the Python bytes back to a JS Uint8Array then grab its buffer
        const resultUint8: Uint8Array = resultProxy.toJs()
        resultProxy.destroy()

        const resultBuffer = resultUint8.buffer
        const totalMs = performance.now() - mergeStart
        const outputKb = Math.round(resultUint8.byteLength / 1024)

        log(
            `[merge:${id}] Done — output size: ${outputKb} KB,`,
            `total time: ${totalMs.toFixed(0)} ms`
        )

        postAnalytics("pdf_merge_complete", {
            file_count: fileCount,
            output_size_kb: outputKb,
            python_duration_ms: Math.round(pythonMs),
            total_duration_ms: Math.round(totalMs),
        })

        const response: WorkerResponse = {
            type: "done",
            id,
            buffer: resultBuffer,
        }
        self.postMessage(response, { transfer: [resultBuffer] })
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        const totalMs = performance.now() - mergeStart

        error(`[merge:${id}] Merge failed after ${totalMs.toFixed(0)} ms:`, message)

        postAnalytics("pdf_merge_error", {
            file_count: fileCount,
            error_message: message,
            duration_ms: Math.round(totalMs),
        })

        const response: WorkerResponse = { type: "error", id, message }
        self.postMessage(response)
    }
}
