// @ts-check
import pkg from "./package.json" with { type: "json" }
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import posthog from '@posthog/rollup-plugin'
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://tools.naveenmk.me",
  vite: {
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    worker: {
      format: "es"
    },
    plugins: [tailwindcss(), posthog({
      personalApiKey: process.env.POSTHOG_API_KEY || "", // Personal API Key
      projectId: process.env.POSTHOG_PROJECT_ID, // Project ID
      host: process.env.POSTHOG_HOST, // (optional) defaults to https://us.i.posthog.com
      sourcemaps: {
        enabled: process.env.POSTHOG_API_KEY ? true : false, // Enable sourcemaps upload
        releaseVersion: pkg.version,
        deleteAfterUpload: true,
      },
    })],
  },
  integrations: [react(), sitemap()],
})