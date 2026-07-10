// ─── Service Worker for Perotron Web PWA ───────────────────────────
// Version placeholder is replaced at build time by the Vite plugin.
// In development, falls back to a timestamp so caches don't persist.
const CACHE_VERSION = "__SW_VERSION__"

const APP_SHELL_CACHE = `app-shell-${CACHE_VERSION}`
const PYODIDE_CDN_CACHE = `pyodide-cdn-${CACHE_VERSION}`
const PYPI_WHEELS_CACHE = `pypi-wheels-${CACHE_VERSION}`

const ALL_CACHES = [APP_SHELL_CACHE, PYODIDE_CDN_CACHE, PYPI_WHEELS_CACHE]

// Known static assets that are always part of the app shell.
// The rest (hashed JS/CSS/font chunks) are discovered from sw-manifest.json.
const STATIC_SHELL_URLS = [
    "/",
    "/site.webmanifest",
    "/favicon.ico",
    "/favicon.svg",
    "/favicon-96x96.png",
    "/apple-touch-icon.png",
    "/web-app-manifest-192x192.png",
    "/web-app-manifest-512x512.png",
    "/logo.svg",
    "/banner.png",
    "/qr-logos/github.svg",
    "/qr-logos/instagram.svg",
    "/qr-logos/linkedin.svg",
    "/qr-logos/whatsapp.svg",
    "/qr-logos/x-twitter.svg",
    "/qr-logos/youtube.svg",
]

// Hostnames that should never be cached (analytics, ads, etc.)
const EXCLUDED_HOSTS = [
    "www.googletagmanager.com",
    "pagead2.googlesyndication.com",
    "www.google-analytics.com",
    "us.posthog.com",
    "us.i.posthog.com",
]

// ─── Install ───────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
    console.log("[sw] Installing — version", CACHE_VERSION)

    event.waitUntil(
        (async () => {
            const cache = await caches.open(APP_SHELL_CACHE)

            // 1. Pre-cache known static shell URLs
            console.log("[sw] Pre-caching static shell URLs")
            await cache.addAll(STATIC_SHELL_URLS)

            // 2. Fetch the build manifest and pre-cache all hashed assets
            try {
                const manifestRes = await fetch("/sw-manifest.json")
                if (manifestRes.ok) {
                    const manifest = await manifestRes.json()
                    if (Array.isArray(manifest.assets) && manifest.assets.length > 0) {
                        console.log(
                            "[sw] Pre-caching",
                            manifest.assets.length,
                            "build assets from sw-manifest.json"
                        )
                        await cache.addAll(manifest.assets)
                    }
                }
            } catch (err) {
                console.warn("[sw] Could not fetch sw-manifest.json:", err)
            }

            // 3. Skip waiting so the new SW activates immediately
            await self.skipWaiting()
            console.log("[sw] Install complete")
        })()
    )
})

// ─── Activate ──────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
    console.log("[sw] Activating — version", CACHE_VERSION)

    event.waitUntil(
        (async () => {
            // Purge all caches that don't belong to the current version
            const keys = await caches.keys()
            await Promise.all(
                keys.filter((key) => !ALL_CACHES.includes(key)).map((key) => {
                    console.log("[sw] Deleting old cache:", key)
                    return caches.delete(key)
                })
            )

            // Take control of all open clients immediately
            await self.clients.claim()
            console.log("[sw] Activated and claimed clients")
        })()
    )
})

// ─── Fetch ─────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
    const { request } = event
    const url = new URL(request.url)

    // Only handle GET requests
    if (request.method !== "GET") return

    // Only handle http/https
    if (!url.protocol.startsWith("http")) return

    // Skip analytics, ads, and tracking
    if (EXCLUDED_HOSTS.some((host) => url.hostname === host || url.hostname.endsWith("." + host))) {
        return
    }

    // ── Pyodide CDN (cache-first) ──────────────────────────────────
    if (url.hostname === "cdn.jsdelivr.net" && url.pathname.includes("/pyodide/")) {
        event.respondWith(cacheFirst(request, PYODIDE_CDN_CACHE))
        return
    }

    // ── PyPI wheels (cache-first) ──────────────────────────────────
    if (url.hostname === "files.pythonhosted.org") {
        event.respondWith(cacheFirst(request, PYPI_WHEELS_CACHE))
        return
    }

    // ── Navigation (network-first, offline fallback) ───────────────
    if (request.mode === "navigate") {
        event.respondWith(navigationHandler(request))
        return
    }

    // ── Same-origin assets (cache-first) ───────────────────────────
    if (url.origin === self.location.origin) {
        event.respondWith(cacheFirst(request, APP_SHELL_CACHE))
        return
    }
})

// ─── Cache Strategies ──────────────────────────────────────────────

/**
 * Cache-first: return from cache if available, otherwise fetch and cache.
 */
async function cacheFirst(request, cacheName) {
    const cached = await caches.match(request)
    if (cached) return cached

    try {
        const response = await fetch(request)
        if (response.ok) {
            const cache = await caches.open(cacheName)
            cache.put(request, response.clone())
        }
        return response
    } catch {
        return new Response("Offline — resource not cached", {
            status: 503,
            statusText: "Service Unavailable",
        })
    }
}

/**
 * Navigation handler: try network first, fall back to cached root page.
 * Since this is a SPA, the root index.html can serve all routes.
 */
async function navigationHandler(request) {
    try {
        const response = await fetch(request)
        if (response.ok) {
            // Cache the navigated page for offline access
            const cache = await caches.open(APP_SHELL_CACHE)
            cache.put(request, response.clone())
        }
        return response
    } catch {
        // Offline: try to serve the exact URL from cache, then fall back to root
        const cached = await caches.match(request)
        if (cached) return cached

        const rootCached = await caches.match("/")
        if (rootCached) return rootCached

        return new Response(
            "<!DOCTYPE html><html><body><h1>Offline</h1><p>Please connect to the internet.</p></body></html>",
            { status: 503, headers: { "Content-Type": "text/html" } }
        )
    }
}
