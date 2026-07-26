/**
 * @file logger.ts
 * Centralised logging provider for Perotron Web.
 *
 * All application logs (info, warn, error, debug) and Web Worker logs are
 * routed through this module. Logs are printed to console (in DEV/E2E mode)
 * and uploaded to PostHog via `captureLog`.
 */

import type { LogAttributeValue } from "posthog-js"
import { captureLog } from "./posthog"

export type LogLevel = "info" | "warn" | "error" | "debug"

export type LogParams = Record<string, LogAttributeValue>

class Logger {
    log(level: LogLevel, message: string, params?: LogParams): void {
        if (import.meta.env.DEV || import.meta.env.PUBLIC_E2E_TEST) {
            const consoleFn = console[level] || console.log
            if (params && Object.keys(params).length > 0) {
                consoleFn(`[${level.toUpperCase()}] ${message}`, params)
            } else {
                consoleFn(`[${level.toUpperCase()}] ${message}`)
            }
        }

        captureLog(level, message, params)
    }

    info(message: string, params?: LogParams): void {
        this.log("info", message, params)
    }

    warn(message: string, params?: LogParams): void {
        this.log("warn", message, params)
    }

    error(message: string, params?: LogParams): void {
        this.log("error", message, params)
    }

    debug(message: string, params?: LogParams): void {
        this.log("debug", message, params)
    }
}

export const logger = new Logger()

/**
 * Attach a message-event listener to a Web Worker that automatically forwards
 * `{ type: "log", level, message, params }` messages from the worker to the logger.
 *
 * Returns a cleanup function.
 */
export function trackWorkerLogs(worker: Worker): () => void {
    const handler = (e: MessageEvent) => {
        if (e.data?.type !== "log") return
        const { level = "info", message = "", params } = e.data as {
            level?: LogLevel
            message?: string
            params?: LogParams
        }
        logger.log(level, message, params)
    }
    worker.addEventListener("message", handler)
    return () => worker.removeEventListener("message", handler)
}
