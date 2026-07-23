import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright configuration for Perotron Web E2E tests.
 *
 * Runs against a Vite preview server on port 4173.
 * The `webServer` block builds the app and starts `vite preview` automatically
 * unless the server is already running.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Fail the build on CI if test.only was accidentally left in source */
  forbidOnly: !!process.env.CI,
  /* Retry on CI to reduce flake; no retries locally */
  retries: process.env.CI ? 2 : 0,
  /* Parallel workers — use half CPUs on CI to avoid OOM */
  workers: process.env.CI ? 2 : undefined,
  /* Reporters */
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["html", { open: "on-failure" }]],
  /* Global test timeout */
  timeout: 60_000,
  /* Shared settings for all projects */
  use: {
    baseURL: "http://localhost:4173",
    /* Collect trace on first retry (useful for CI debugging) */
    trace: "on-first-retry",
    /* Screenshot on failure */
    screenshot: "only-on-failure",
    /* Video on first retry */
    video: "on-first-retry",
  },
  /* Global setup — generate test PDF fixtures before any tests run */
  globalSetup: "./e2e/fixtures/generate-pdfs.ts",

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    /* Mobile viewports */
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 14"] },
    },
  ],

  /* Build the app and start a preview server before tests */
  webServer: {
    command: "pnpm exec astro preview --port 4173",
    port: 4173,
    reuseExistingServer: !process.env.CI,
    /* The preview server starts fast since the build is already done */
    timeout: 30_000,
  },
})
