import type { Page } from "@playwright/test"
import { expect } from "@playwright/test"

/**
 * Wait for the SPA shell to be fully interactive.
 * Looks for the header with the "Perotron Web" brand text.
 */
export async function waitForAppReady(page: Page) {
  await page.waitForLoadState("load")
  await expect(page.locator("header")).toBeVisible()
}

/** Navigate to the home page and wait for readiness. */
export async function navigateToHome(page: Page) {
  await page.goto("/")
  await waitForAppReady(page)
}

/** Navigate to the PDF Merge tool page. */
export async function navigateToPdfMerge(page: Page) {
  await page.goto("/pdf/merge")
  await waitForAppReady(page)
}

/** Navigate to the PDF Split tool page. */
export async function navigateToPdfSplit(page: Page) {
  await page.goto("/pdf/split")
  await waitForAppReady(page)
}

/** Navigate to the QR Code Generator page. */
export async function navigateToQrGenerator(page: Page) {
  await page.goto("/qr/generator")
  await waitForAppReady(page)
}

/** Navigate to the PDF category landing page. */
export async function navigateToPdfIndex(page: Page) {
  await page.goto("/pdf")
  await waitForAppReady(page)
}

/** Navigate to the QR category landing page. */
export async function navigateToQrIndex(page: Page) {
  await page.goto("/qr")
  await waitForAppReady(page)
}

/**
 * Upload files to a file input on the page.
 * @param page      - The Playwright page
 * @param selector  - CSS selector for the <input type="file">
 * @param filePaths - Absolute paths to the files to upload
 */
export async function uploadFiles(
  page: Page,
  selector: string,
  filePaths: string[]
) {
  const input = page.locator(selector)
  await input.setInputFiles(filePaths)
}

/**
 * Get the fixture path for a generated test file.
 */
export function fixturePath(filename: string): string {
  // Resolve relative to the project root
  return `e2e/fixtures/${filename}`
}
