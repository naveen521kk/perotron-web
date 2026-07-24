import posthog, {
    PostHog,
    type EventName,
    type Properties,
    type CaptureOptions,
} from "posthog-js"

declare global {
    interface Window {
        __posthog: PostHog | null | undefined
    }
}

const posthogOptions = {
    api_host: import.meta.env.PUBLIC_POSTHOG_HOST,
    ui_host: "https://us.posthog.com",
    defaults: "2026-05-30",
    capture_exceptions: true,
} as const

class PostHogClient {
    private instance: PostHog | null | undefined
    private initialized = false

    init() {
        if (typeof window === "undefined") {
            return
        }

        if (import.meta.env.DEV) {
            console.info(
                "[PostHog] development mode: events will be logged only"
            )
            return
        }

        if (import.meta.env.PUBLIC_E2E_TEST) {
            console.info(
                "[PostHog] e2e mode: events will be logged to console only"
            )
            return
        }

        if (this.initialized || posthog.__loaded) {
            this.instance = window.__posthog ?? this.instance
            return
        }

        this.instance = posthog.init(
            import.meta.env.PUBLIC_POSTHOG_PROJECT_TOKEN,
            posthogOptions
        )
        window.__posthog = this.instance
        this.initialized = true
        console.info("[PostHog] initialized with options:", posthogOptions)
    }

    getInstance(): PostHog | null | undefined {
        if (typeof window !== "undefined") {
            this.instance = window.__posthog ?? this.instance
        }

        return this.instance
    }

    private logEvent(
        event: string,
        params?: Properties | null,
        options?: CaptureOptions
    ) {
        if (import.meta.env.DEV) {
            console.info("[PostHog]", event, { params, options })
        }
        if (import.meta.env.PUBLIC_E2E_TEST) {
            // Emit a structured log line that Playwright can intercept via
            // page.on('console'). Format: [PostHog:E2E] <JSON>
            console.log(
                "[PostHog:E2E]",
                JSON.stringify({ event, params: params ?? null })
            )
        }
    }

    reportPageNotFound(pathname: string) {
        this.captureEvent("page_not_found", { path: pathname })
    }

    captureClientException(error: Error, context?: Record<string, any>) {
        this.logEvent("captureException", {
            error,
            context,
            version: __APP_VERSION__,
        })

        const ph = this.getInstance()
        if (ph) {
            ph.captureException(error, { ...context, version: __APP_VERSION__ })
        }
    }

    captureEvent(
        event: EventName,
        params?: Properties | null,
        options?: CaptureOptions
    ) {
        this.logEvent(String(event), params, options)

        const ph = this.getInstance()
        if (ph) {
            ph.capture(event, params, options)
        }
    }

    getLogger() {
        const ph = this.getInstance()
        if (ph) {
            return ph.logger
        }
    }
}

const posthogClient = new PostHogClient()

function initPostHog() {
    posthogClient.init()
}

function reportPageNotFound(pathname: string) {
    posthogClient.reportPageNotFound(pathname)
}

function captureClientException(error: Error, context?: Record<string, any>) {
    posthogClient.captureClientException(error, context)
}

function captureEvent(
    event: EventName,
    params?: Properties | null,
    options?: CaptureOptions
) {
    posthogClient.captureEvent(event, params, options)
}

export { initPostHog, reportPageNotFound, captureClientException, captureEvent }
