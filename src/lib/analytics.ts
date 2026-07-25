/**
 * @file analytics.ts
 * Centralised analytics layer for Perotron Web.
 *
 * All telemetry — regardless of provider — is routed through this module.
 * Individual tools and components must NOT import directly from posthog-js,
 * call `window.gtag`, or reference any other provider SDK. They should only
 * use the public surface exported here:
 *
 *   import { trackEvent, trackWorkerAnalytics } from "@/lib/analytics"
 *
 * Adding or removing a provider in the future requires changes only in this
 * file, not across every tool that fires events.
 */

import {
    captureEvent as posthogCaptureEvent,
    captureClientException as posthogCaptureClientException,
    initPostHog,
    reportPageNotFound as posthogReportPageNotFound,
} from "./posthog"
import { logger, trackWorkerLogs, type LogLevel, type LogParams } from "./logger"

export { logger, trackWorkerLogs }

/* ── Types ────────────────────────────────────────────────────────── */

export type AnalyticsParams = Record<string, string | number | boolean | null>

/* ── Provider: Google Analytics (gtag) ──────────────────────────── */

/**
 * Send a single event to Google Analytics via the globally-loaded gtag script.
 * Safe to call even if gtag has not been loaded (e.g. blocked by an ad-blocker
 * or in development/test mode).
 */
function dispatchGtag(event: string, params: AnalyticsParams): void {
    if (!import.meta.env.PROD) return

    const w = window as Window & { gtag?: (...args: unknown[]) => void }
    if (typeof w.gtag === "function") {
        w.gtag("event", event, params)
    }
}

/* ── Public API ───────────────────────────────────────────────────── */

/**
 * Track a named analytics event with optional properties.
 * Dispatches to every configured provider automatically.
 *
 * @example
 *   trackEvent("pdf_merge_complete", { file_count: 3, output_size_kb: 420 })
 */
export function trackEvent(event: string, params: AnalyticsParams = {}): void {
    dispatchGtag(event, params)
    posthogCaptureEvent(event, params)
}

/**
 * Attach a message-event listener to a Web Worker that automatically forwards
 * `{ type: "analytics", event, params }` and `{ type: "log", level, message, params }`
 * messages from the worker to all analytics and logging providers.
 *
 * Returns a cleanup function that removes the listener. Typically used inside a
 * `useEffect` cleanup.
 *
 * @example
 *   useEffect(() => {
 *     const worker = new Worker(…)
 *     const cleanup = trackWorkerAnalytics(worker)
 *     return () => { worker.terminate(); cleanup() }
 *   }, [])
 */
export function trackWorkerAnalyticsAndLogs(worker: Worker): () => void {
    const handler = (e: MessageEvent) => {
        if (!e.data || typeof e.data !== "object") return

        if (e.data.type === "analytics") {
            const { event, params } = e.data as {
                event: string
                params: AnalyticsParams
            }
            trackEvent(event, params)
        } else if (e.data.type === "log") {
            const { level = "info", message = "", params } = e.data as {
                level?: LogLevel
                message?: string
                params?: LogParams
            }
            logger.log(level, message, params)
        }
    }
    worker.addEventListener("message", handler)
    return () => worker.removeEventListener("message", handler)
}

/**
 * Report a caught exception to all error-tracking providers.
 */
export function trackException(
    error: Error,
    context?: Record<string, unknown>
): void {
    posthogCaptureClientException(error, context)
}

/**
 * Report a 404 / page-not-found event.
 * Called once per navigation to a missing route.
 */
export function trackPageNotFound(pathname: string): void {
    posthogReportPageNotFound(pathname)
}

/**
 * Initialise all analytics providers.
 * Should be called once, as early as possible (e.g. in the root layout).
 */
export function initAnalytics(): void {
    initPostHog()
}
