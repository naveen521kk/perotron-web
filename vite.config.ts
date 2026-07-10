import { defineConfig, type PluginOption } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import fs from "node:fs"
import path from "node:path"
import pkg from "./package.json" with { type: "json" }

/**
 * Vite plugin that runs after the build to:
 * 1. Generate `sw-manifest.json` listing all hashed build assets for SW pre-caching.
 * 2. Replace the `__SW_VERSION__` placeholder in `sw.js` with the app version.
 */
function swManifestPlugin(): PluginOption {
    return {
        name: "sw-manifest",
        apply: "build",
        closeBundle() {
            // Use dist/client as the output directory (TanStack Start convention)
            const clientDir = path.resolve("dist", "client")
            if (!fs.existsSync(clientDir)) return

            // Collect all files that should be pre-cached
            const assets: string[] = []

            function walk(dir: string, prefix: string) {
                for (const entry of fs.readdirSync(dir, {
                    withFileTypes: true,
                })) {
                    const relPath = `${prefix}/${entry.name}`

                    if (entry.isDirectory()) {
                        // Skip hidden dirs and the 'old' directory
                        if (
                            entry.name.startsWith(".") ||
                            entry.name === "old"
                        )
                            continue
                        walk(path.join(dir, entry.name), relPath)
                    } else {
                        // Skip files that don't need caching
                        if (
                            [
                                "sw.js",
                                "sw-manifest.json",
                                "_redirects",
                                "robots.txt",
                                "sitemap.xml",
                                "ads.txt",
                                "pages.json",
                            ].includes(entry.name)
                        )
                            continue

                        // Skip the manifest (already in STATIC_SHELL_URLS)
                        if (entry.name === "site.webmanifest")
                            continue

                        // Skip root index.html (already in STATIC_SHELL_URLS as "/")
                        // but include pre-rendered sub-route HTML files
                        if (
                            entry.name === "index.html" &&
                            prefix === ""
                        )
                            continue

                        assets.push(relPath)
                    }
                }
            }

            walk(clientDir, "")

            // Write the manifest
            const manifestPath = path.join(clientDir, "sw-manifest.json")
            fs.writeFileSync(
                manifestPath,
                JSON.stringify({ version: pkg.version, assets }, null, 2)
            )
            console.log(
                `[sw-manifest] Generated sw-manifest.json with ${assets.length} assets`
            )

            // Inject version into sw.js
            const swPath = path.join(clientDir, "sw.js")
            if (fs.existsSync(swPath)) {
                let swContent = fs.readFileSync(swPath, "utf-8")
                swContent = swContent.replace(/__SW_VERSION__/g, pkg.version)
                fs.writeFileSync(swPath, swContent)
                console.log(
                    `[sw-manifest] Injected version ${pkg.version} into sw.js`
                )
            }
        },
    }
}

const config = defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
    resolve: { tsconfigPaths: true },
    plugins: [
        devtools(),
        tailwindcss(),
        tanstackStart({
            spa: {
                enabled: true,
                prerender: {
                    crawlLinks: true,
                    retryCount: 3,
                },
            },
            prerender: {
                enabled: true,
            },
            sitemap: {
                enabled: true,
                host: "https://tools.naveenmk.me",
            },
            // Below is a hack to static render root index.html, otherwise the index.html is missing from the output
            // do no the `/#` is important here. Might be this is because of SPA mode.
            // do note to validate this when upgrading tanstack-start.
            pages: [
                {
                    path: "/#",
                    prerender: {
                        enabled: true,
                        outputPath: "/index.html",
                    },
                },
            ],
        }),
        viteReact(),
        swManifestPlugin(),
    ],
})

export default config

