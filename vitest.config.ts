import { defineConfig } from "vitest/config"
import { resolve } from "path"

export default defineConfig({
    test: {
        // Use happy-dom for a lightweight DOM environment (needed by Zustand, cn, etc.)
        environment: "happy-dom",

        // Glob patterns that match unit test files
        include: ["src/**/*.{test,spec}.{ts,tsx}"],

        // Exclude e2e tests
        exclude: ["e2e/**", "node_modules/**", "dist/**"],

        // Global coverage configuration (opt-in via --coverage flag)
        coverage: {
            provider: "v8",
            include: [
                "src/lib/**",
                "src/tools/**/store/**",
                "src/tools/**/utils.ts",
                "src/tools/**/constants.tsx",
            ],
            exclude: [
                "src/**/*.test.{ts,tsx}",
                "src/**/*.spec.{ts,tsx}",
                // Worker file requires Pyodide — skip from coverage
                "src/tools/pdf-tools/pdf-worker.ts",
                // React component files
                "src/tools/pdf-tools/merge.tsx",
                "src/tools/pdf-tools/split.tsx",
                "src/tools/pdf-tools/pdf-thumbnail.tsx",
                "src/tools/qr-tools/index.tsx",
                // posthog lib has browser / env coupling — separate concern
                "src/lib/posthog.ts",
                // qr-tools doesn't have unit tests since fully browser based (e2e covers it)
                "src/tools/qr-tools/constants.tsx",
            ],
            reporter: ["text", "lcov", "html"],
        },
    },

    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },

    // Expose the __APP_VERSION__ global that several source files reference
    define: {
        __APP_VERSION__: JSON.stringify("0.0.0-test"),
    },
})
