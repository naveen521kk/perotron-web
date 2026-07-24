import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"

/**
 * Represents a single captured PostHog event extracted from a console message
 * (E2E mode) or an intercepted network request (legacy).
 */
export interface CapturedPostHogEvent {
  event: string
  properties: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Console-based helpers (preferred — works with PUBLIC_E2E_TEST=true)
// ---------------------------------------------------------------------------

/**
 * Start collecting PostHog events that posthog.ts emits to the console when
 * `PUBLIC_E2E_TEST=true` is baked into the build.
 *
 * Each event is logged as:
 *   [PostHog:E2E] {"event":"<name>","params":{...}}
 *
 * Call this BEFORE navigating to the page so no events are missed.
 * Returns a mutable array that accumulates events as the page runs.
 */
export function collectPostHogConsoleEvents(page: Page): CapturedPostHogEvent[] {
  const events: CapturedPostHogEvent[] = []

  page.on("console", (msg) => {
    const text = msg.text()
    if (!text.startsWith("[PostHog:E2E]")) return

    try {
      const json = text.slice("[PostHog:E2E]".length).trim()
      const parsed = JSON.parse(json) as {
        event: string
        params: Record<string, unknown> | null
      }
      events.push({
        event: parsed.event,
        properties: parsed.params ?? {},
      })
    } catch {
      // Ignore malformed log lines
    }
  })

  return events
}

// ---------------------------------------------------------------------------
// Network-interception helpers (legacy — kept for reference)
// ---------------------------------------------------------------------------

/**
 * Set up network interception to capture outgoing PostHog events.
 *
 * @deprecated Prefer {@link collectPostHogConsoleEvents} when the app is built
 * with `PUBLIC_E2E_TEST=true` (the default in `playwright.config.ts`).
 * This helper is only useful if you need to test against a production build
 * without the E2E flag.
 */
export async function interceptPostHogEvents(
  page: Page
): Promise<CapturedPostHogEvent[]> {
  const events: CapturedPostHogEvent[] = []

  // Intercept any request whose URL contains typical PostHog ingest paths
  await page.route(
    (url) => {
      const href = url.toString()
      return (
        href.includes("/e/") || // PostHog /e/ batch endpoint
        href.includes("/capture/") || // PostHog /capture/ endpoint
        href.includes("/batch/") || // PostHog /batch/ endpoint
        href.includes("posthog.com") ||
        href.includes("i.posthog.com") ||
        href.includes("a.naveenmk.me")
      )
    },
    async (route) => {
      try {
        const request = route.request()
        const postData = request.postDataJSON()

        if (postData) {
          // PostHog sends batched events or single events
          if (Array.isArray(postData)) {
            for (const item of postData) {
              if (item.event) {
                events.push({
                  event: item.event,
                  properties: item.properties ?? {},
                })
              }
            }
          } else if (postData.batch && Array.isArray(postData.batch)) {
            for (const item of postData.batch) {
              if (item.event) {
                events.push({
                  event: item.event,
                  properties: item.properties ?? {},
                })
              }
            }
          } else if (postData.event) {
            events.push({
              event: postData.event,
              properties: postData.properties ?? {},
            })
          }
        }
      } catch {
        // If postData is not JSON, ignore it
      }

      // Respond with 200 OK so the app doesn't retry
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ status: 1 }),
      })
    }
  )

  return events
}

// ---------------------------------------------------------------------------
// Assertion helpers (shared)
// ---------------------------------------------------------------------------

/**
 * Assert that a PostHog event with the given name was captured.
 * Optionally check that the event properties contain the expected key/value
 * pairs (partial match).
 */
export function expectPostHogEvent(
  events: CapturedPostHogEvent[],
  eventName: string,
  expectedProperties?: Record<string, unknown>
) {
  const matching = events.filter((e) => e.event === eventName)
  expect(
    matching.length,
    `Expected PostHog event "${eventName}" to have been captured. Got events: ${JSON.stringify(events.map((e) => e.event))}`
  ).toBeGreaterThan(0)

  if (expectedProperties) {
    const hasMatch = matching.some((evt) =>
      Object.entries(expectedProperties).every(
        ([key, value]) => evt.properties[key] === value
      )
    )
    expect(
      hasMatch,
      `Expected PostHog event "${eventName}" with properties ${JSON.stringify(expectedProperties)}. Got: ${JSON.stringify(matching.map((e) => e.properties))}`
    ).toBe(true)
  }
}

/**
 * Assert that NO PostHog event with the given name was captured.
 */
export function expectNoPostHogEvent(
  events: CapturedPostHogEvent[],
  eventName: string
) {
  const matching = events.filter((e) => e.event === eventName)
  expect(
    matching.length,
    `Expected PostHog event "${eventName}" NOT to have been captured, but found ${matching.length}.`
  ).toBe(0)
}
