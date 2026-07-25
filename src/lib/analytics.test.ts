import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
    trackEvent,
    trackWorkerAnalyticsAndLogs,
    trackException,
    trackPageNotFound,
    initAnalytics,
    logger,
} from "./analytics"
import * as posthog from "./posthog"

describe("Analytics module", () => {
    beforeEach(() => {
        vi.restoreAllMocks()
        vi.unstubAllEnvs()
    })

    afterEach(() => {
        vi.restoreAllMocks()
        vi.unstubAllEnvs()
    })

    describe("trackEvent()", () => {
        it("forwards event to posthog captureEvent", () => {
            const captureEventSpy = vi
                .spyOn(posthog, "captureEvent")
                .mockImplementation(() => {})

            trackEvent("test_event", { foo: "bar" })

            expect(captureEventSpy).toHaveBeenCalledWith("test_event", {
                foo: "bar",
            })
        })

        it("dispatches to window.gtag if present in PROD mode", () => {
            const captureEventSpy = vi
                .spyOn(posthog, "captureEvent")
                .mockImplementation(() => {})

            const gtagSpy = vi.fn()
            ;(window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy

            vi.stubEnv("PROD", true as any)

            try {
                trackEvent("prod_event", { count: 5 })

                expect(gtagSpy).toHaveBeenCalledWith("event", "prod_event", {
                    count: 5,
                })
                expect(captureEventSpy).toHaveBeenCalledWith("prod_event", {
                    count: 5,
                })
            } finally {
                delete (window as unknown as { gtag?: unknown }).gtag
            }
        })
    })

    describe("trackWorkerAnalytics()", () => {
        it("listens to worker 'analytics' messages and calls trackEvent", () => {
            const captureEventSpy = vi
                .spyOn(posthog, "captureEvent")
                .mockImplementation(() => {})
            const listeners: Array<(e: MessageEvent) => void> = []

            const fakeWorker = {
                addEventListener: vi.fn(
                    (type: string, handler: (e: MessageEvent) => void) => {
                        if (type === "message") listeners.push(handler)
                    }
                ),
                removeEventListener: vi.fn(
                    (type: string, handler: (e: MessageEvent) => void) => {
                        const idx = listeners.indexOf(handler)
                        if (idx !== -1) listeners.splice(idx, 1)
                    }
                ),
            } as unknown as Worker

            const cleanup = trackWorkerAnalyticsAndLogs(fakeWorker)

            const event = new MessageEvent("message", {
                data: {
                    type: "analytics",
                    event: "worker_event",
                    params: { success: true },
                },
            })
            listeners.forEach((l) => l(event))

            expect(captureEventSpy).toHaveBeenCalledWith("worker_event", {
                success: true,
            })

            cleanup()
            expect(fakeWorker.removeEventListener).toHaveBeenCalled()
        })

        it("listens to worker 'log' messages and forwards them to logger", () => {
            const logSpy = vi.spyOn(logger, "log").mockImplementation(() => {})
            const listeners: Array<(e: MessageEvent) => void> = []

            const fakeWorker = {
                addEventListener: vi.fn(
                    (type: string, handler: (e: MessageEvent) => void) => {
                        if (type === "message") listeners.push(handler)
                    }
                ),
                removeEventListener: vi.fn(),
            } as unknown as Worker

            trackWorkerAnalyticsAndLogs(fakeWorker)

            const event = new MessageEvent("message", {
                data: {
                    type: "log",
                    level: "error",
                    message: "Worker crashed",
                    params: { code: 500 },
                },
            })
            listeners.forEach((l) => l(event))

            expect(logSpy).toHaveBeenCalledWith("error", "Worker crashed", {
                code: 500,
            })
        })

        it("ignores malformed worker messages", () => {
            const captureEventSpy = vi
                .spyOn(posthog, "captureEvent")
                .mockImplementation(() => {})
            const logSpy = vi.spyOn(logger, "log").mockImplementation(() => {})
            const listeners: Array<(e: MessageEvent) => void> = []

            const fakeWorker = {
                addEventListener: vi.fn(
                    (type: string, handler: (e: MessageEvent) => void) => {
                        if (type === "message") listeners.push(handler)
                    }
                ),
                removeEventListener: vi.fn(),
            } as unknown as Worker

            trackWorkerAnalyticsAndLogs(fakeWorker)

            listeners.forEach((l) =>
                l(new MessageEvent("message", { data: null }))
            )
            listeners.forEach((l) =>
                l(new MessageEvent("message", { data: "string data" }))
            )

            expect(captureEventSpy).not.toHaveBeenCalled()
            expect(logSpy).not.toHaveBeenCalled()
        })
    })

    describe("trackException()", () => {
        it("forwards error to posthog captureClientException", () => {
            const exceptionSpy = vi
                .spyOn(posthog, "captureClientException")
                .mockImplementation(() => {})

            const err = new Error("Test error")
            trackException(err, { extra: "context" })

            expect(exceptionSpy).toHaveBeenCalledWith(err, { extra: "context" })
        })
    })

    describe("trackPageNotFound()", () => {
        it("forwards pathname to posthog reportPageNotFound", () => {
            const notFoundSpy = vi
                .spyOn(posthog, "reportPageNotFound")
                .mockImplementation(() => {})

            trackPageNotFound("/missing-page")

            expect(notFoundSpy).toHaveBeenCalledWith("/missing-page")
        })
    })

    describe("initAnalytics()", () => {
        it("calls initPostHog", () => {
            const initSpy = vi
                .spyOn(posthog, "initPostHog")
                .mockImplementation(() => {})

            initAnalytics()

            expect(initSpy).toHaveBeenCalled()
        })
    })
})
