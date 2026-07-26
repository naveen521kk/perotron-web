import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { logger, trackWorkerLogs } from "./logger"
import * as posthog from "./posthog"

describe("Logger module", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    afterEach(() => {
        vi.restoreAllMocks()
    })

    describe("logger methods", () => {
        it("calls captureLog with 'info' level when logger.info is invoked", () => {
            const captureLogSpy = vi.spyOn(posthog, "captureLog").mockImplementation(() => {})

            logger.info("Test info message", { foo: "bar" })

            expect(captureLogSpy).toHaveBeenCalledWith("info", "Test info message", { foo: "bar" })
        })

        it("calls captureLog with 'warn' level when logger.warn is invoked", () => {
            const captureLogSpy = vi.spyOn(posthog, "captureLog").mockImplementation(() => {})

            logger.warn("Test warn message", { detail: 123 })

            expect(captureLogSpy).toHaveBeenCalledWith("warn", "Test warn message", { detail: 123 })
        })

        it("calls captureLog with 'error' level when logger.error is invoked", () => {
            const captureLogSpy = vi.spyOn(posthog, "captureLog").mockImplementation(() => {})

            logger.error("Test error message", { err: "failed" })

            expect(captureLogSpy).toHaveBeenCalledWith("error", "Test error message", { err: "failed" })
        })

        it("calls captureLog with 'debug' level when logger.debug is invoked", () => {
            const captureLogSpy = vi.spyOn(posthog, "captureLog").mockImplementation(() => {})

            logger.debug("Test debug message")

            expect(captureLogSpy).toHaveBeenCalledWith("debug", "Test debug message", undefined)
        })

        it("handles empty parameters gracefully", () => {
            const captureLogSpy = vi.spyOn(posthog, "captureLog").mockImplementation(() => {})

            logger.log("info", "Simple message")

            expect(captureLogSpy).toHaveBeenCalledWith("info", "Simple message", undefined)
        })
    })

    describe("trackWorkerLogs", () => {
        it("listens to worker log messages and forwards them to logger", () => {
            const logSpy = vi.spyOn(logger, "log").mockImplementation(() => {})
            const listeners: Array<(e: MessageEvent) => void> = []

            const fakeWorker = {
                addEventListener: vi.fn((type: string, handler: (e: MessageEvent) => void) => {
                    if (type === "message") listeners.push(handler)
                }),
                removeEventListener: vi.fn((_: string, handler: (e: MessageEvent) => void) => {
                    const idx = listeners.indexOf(handler)
                    if (idx !== -1) listeners.splice(idx, 1)
                }),
            } as unknown as Worker

            const cleanup = trackWorkerLogs(fakeWorker)
            expect(fakeWorker.addEventListener).toHaveBeenCalledWith("message", expect.any(Function))

            // Trigger worker message
            const event = new MessageEvent("message", {
                data: { type: "log", level: "warn", message: "Worker warning", params: { id: 42 } },
            })
            listeners.forEach((l) => l(event))

            expect(logSpy).toHaveBeenCalledWith("warn", "Worker warning", { id: 42 })

            // Test cleanup
            cleanup()
            expect(fakeWorker.removeEventListener).toHaveBeenCalledWith("message", expect.any(Function))
        })

        it("ignores non-log worker messages", () => {
            const logSpy = vi.spyOn(logger, "log").mockImplementation(() => {})
            const listeners: Array<(e: MessageEvent) => void> = []

            const fakeWorker = {
                addEventListener: vi.fn((type: string, handler: (e: MessageEvent) => void) => {
                    if (type === "message") listeners.push(handler)
                }),
                removeEventListener: vi.fn(),
            } as unknown as Worker

            trackWorkerLogs(fakeWorker)

            const event = new MessageEvent("message", {
                data: { type: "analytics", event: "pdf_merge_complete" },
            })
            listeners.forEach((l) => l(event))

            expect(logSpy).not.toHaveBeenCalled()
        })
    })
})
