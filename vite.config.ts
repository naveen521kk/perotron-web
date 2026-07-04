import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import pkg from "./package.json" with { type: "json" }

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
    ],
})

export default config
