import { defineConfig } from "vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

const config = defineConfig({
    resolve: { tsconfigPaths: true },
    plugins: [
        devtools(),
        tailwindcss(),
        tanstackStart({
            spa: {
                enabled: true,
                prerender: {
                    outputPath: "/index",
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
        }),
        viteReact(),
    ],
})

export default config
