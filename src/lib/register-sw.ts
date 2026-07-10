/**
 * Service Worker registration and Pyodide warm-up.
 *
 * After the SW activates, we spawn the pdf-worker in the background to
 * pre-cache Pyodide runtime, micropip, pypdf, and the pyodide_tools wheel.
 * This ensures full offline functionality after the first page visit.
 */

const log = (...args: unknown[]) => console.log("[register-sw]", ...args)
const warn = (...args: unknown[]) => console.warn("[register-sw]", ...args)

/**
 * Spawn the pdf-worker in the background to warm up Pyodide.
 * The worker eagerly loads Pyodide + micropip + pyodide_tools on creation.
 * We send a "warm-up" message to also trigger pypdf installation.
 * The SW intercepts and caches all CDN/PyPI fetches.
 */
function warmUpPyodide() {
    log("Starting Pyodide warm-up…")

    try {
        const worker = new Worker(
            new URL("./pdf-worker.ts", import.meta.url),
            { type: "module" }
        )

        worker.addEventListener("message", (e: MessageEvent) => {
            const data = e.data as { type: string; id?: number }

            if (data.type === "ready") {
                log("Worker ready — sending warm-up command")
                worker.postMessage({ type: "warm-up", id: 0 })
            }

            if (data.type === "warm-up-done") {
                log("Pyodide warm-up complete — all resources cached for offline")
                worker.terminate()
            }

            if (data.type === "error" && data.id === 0) {
                warn("Warm-up failed — resources may not be fully cached")
                worker.terminate()
            }
        })

        // Safety: terminate the worker after 2 minutes even if warm-up hasn't completed
        setTimeout(() => {
            log("Warm-up timeout — terminating worker")
            worker.terminate()
        }, 120_000)
    } catch (err) {
        warn("Failed to spawn warm-up worker:", err)
    }
}

/**
 * Register the service worker.
 * Should only be called in production — guarded by the caller.
 */
export async function registerSW() {
    if (!("serviceWorker" in navigator)) {
        warn("Service workers not supported")
        return
    }

    try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
        })

        log("Service worker registered:", registration.scope)

        // If there's a waiting worker, it means a new version is available.
        // The new SW will activate on next page load (or via skipWaiting).
        if (registration.waiting) {
            log("New service worker waiting to activate")
        }

        // Listen for new service worker installations
        registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (!newWorker) return

            newWorker.addEventListener("statechange", () => {
                if (
                    newWorker.state === "activated" &&
                    navigator.serviceWorker.controller
                ) {
                    log("New service worker activated")
                }
            })
        })

        // When the SW first takes control (first visit or after update),
        // warm up Pyodide in the background to pre-cache all dependencies.
        if (navigator.serviceWorker.controller) {
            // SW already active — warm up now
            warmUpPyodide()
        } else {
            // Wait for the SW to take control (first install)
            navigator.serviceWorker.addEventListener(
                "controllerchange",
                () => {
                    log("Service worker now controlling the page")
                    warmUpPyodide()
                },
                { once: true }
            )
        }
    } catch (err) {
        warn("Service worker registration failed:", err)
    }
}
