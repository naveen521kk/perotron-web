import { useEffect, useState } from "react"

/**
 * E2E-only error trigger component.
 *
 * This component is a complete no-op in production and development builds.
 * When the app is compiled with `PUBLIC_E2E_TEST=true` (i.e. during
 * Playwright test runs), it attaches a `keydown` listener for
 * Ctrl+Shift+E. Pressing that shortcut causes the component to throw a
 * real React error on its next render, which propagates up to the nearest
 * `DefaultCatchBoundary` and exercises the full error-reporting path
 * (boundary UI + PostHog `captureException` event).
 *
 * The component must be rendered **inside** `DefaultCatchBoundary` so the
 * thrown error is caught by it rather than crashing the page.
 */
export function E2EErrorTrigger() {
    // Only wire up any logic when the E2E build flag is present.
    // Tree-shaking will eliminate everything below in production builds.
    if (!import.meta.env.PUBLIC_E2E_TEST) {
        return null
    }

    return <E2EErrorTriggerInner />
}

/** Inner component that actually holds the state and effect. */
function E2EErrorTriggerInner() {
    const [shouldThrow, setShouldThrow] = useState(false)

    useEffect(() => {
        console.log("Setting up...")
        function handleKeyDown(event: KeyboardEvent) {
            // Shortcut: Ctrl + Shift + E
            if (
                event.ctrlKey &&
                event.shiftKey &&
                event.key.toUpperCase() === "E"
            ) {
                event.preventDefault()
                setShouldThrow(true)
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    if (shouldThrow) {
        throw new Error("E2E test error trigger (Ctrl+Shift+E)")
    }

    return null
}
