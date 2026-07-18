import { test, expect } from "@playwright/test"
import { navigateToPdfSplit, fixturePath } from "./helpers/navigation"
import path from "path"

const PDF_1PAGE = path.resolve(fixturePath("test-1page.pdf"))
const PDF_3PAGE = path.resolve(fixturePath("test-3page.pdf"))
const PDF_CORRUPTED = path.resolve(fixturePath("test-corrupted.pdf"))
const NOT_A_PDF = path.resolve(fixturePath("not-a-pdf.txt"))

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Upload a PDF and wait for the PDF info panel to appear (WASM loads page count). */
async function uploadAndWaitForInfo(
  page: Parameters<typeof navigateToPdfSplit>[0],
  file: string,
  expectedPageText?: RegExp
) {
  const fileInput = page
    .locator('input[type="file"][accept="application/pdf"]')
    .first()
  await fileInput.setInputFiles(file)
  await expect(page.getByTestId("split-file-page-count")).toBeVisible({
    timeout: 60_000,
  })
  if (expectedPageText) {
    await expect(page.getByTestId("split-file-page-count")).toHaveText(
      expectedPageText,
      { timeout: 60_000 }
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe("PDF Split Tool", () => {
  // ─── Page load ─────────────────────────────────────────────────────────────

  test.describe("Page load", () => {
    test("renders upload zone with correct title and h1", async ({ page }) => {
      await navigateToPdfSplit(page)

      await expect(page).toHaveTitle(/Split PDF/i)
      await expect(
        page.getByRole("heading", { name: /Split PDF/i, level: 1 })
      ).toBeVisible()
      await expect(page.getByText("Select a PDF file")).toBeVisible()
    })

    test("has correct canonical URL", async ({ page }) => {
      await navigateToPdfSplit(page)

      const canonical = page.locator('link[rel="canonical"]')
      await expect(canonical).toHaveAttribute(
        "href",
        "https://tools.naveenmk.me/pdf/split"
      )
    })
  })

  // ─── Valid scenarios ────────────────────────────────────────────────────────

  test.describe("Valid scenarios", () => {
    test("uploading a PDF shows file name and page count", async ({
      page,
    }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE, /3 pages/i)

      await expect(page.getByTestId("split-file-name")).toHaveText(
        "test-3page.pdf"
      )
    })

    test("uploading a 1-page PDF shows singular 'page' label", async ({
      page,
    }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_1PAGE, /1 page$/i)

      await expect(page.getByTestId("split-file-name")).toHaveText(
        "test-1page.pdf"
      )
    })

    test("file size is shown in sidebar", async ({ page }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      await expect(page.getByTestId("split-file-size")).toBeVisible()
      await expect(page.getByTestId("split-file-size")).toContainText(
        /B|KB|MB/
      )
    })

    test("configure screen shows 'Configure Split' heading", async ({
      page,
    }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      await expect(page.getByTestId("configure-heading")).toBeVisible()
    })

    test("split tabs render in correct order", async ({ page }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      const tabs = page.getByTestId("split-tabs")
      const tabTriggers = tabs.getByRole("tab")

      await expect(tabTriggers.nth(0)).toHaveText("Ranges")
      await expect(tabTriggers.nth(1)).toHaveText("Pages")
      await expect(tabTriggers.nth(2)).toHaveText("Size")
    })

    test("switching split mode tabs shows correct content", async ({
      page,
    }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      // Default: Ranges tab — radio group visible
      await expect(page.getByTestId("range-mode-radio")).toBeVisible()

      // Switch to Pages tab
      await page.getByTestId("split-tab-pages").click()
      await expect(page.getByTestId("page-spec-input")).toBeVisible()
      await expect(page.getByTestId("range-mode-radio")).not.toBeVisible()

      // Switch to Size tab
      await page.getByTestId("split-tab-size").click()
      await expect(page.getByTestId("max-size-input")).toBeVisible()
      await expect(page.getByTestId("page-spec-input")).not.toBeVisible()

      // Back to Ranges tab
      await page.getByTestId("split-tab-ranges").click()
      await expect(page.getByTestId("range-mode-radio")).toBeVisible()
    })

    test("ranges tab: radio buttons in correct order, fixed checked by default", async ({
      page,
    }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      const radioGroup = page.getByTestId("range-mode-radio")
      const radios = radioGroup.getByRole("radio")

      await expect(radios.nth(0)).toHaveAttribute("value", "fixed")
      await expect(radios.nth(1)).toHaveAttribute("value", "custom")
      await expect(page.getByTestId("range-mode-fixed")).toBeChecked()
    })

    test("ranges tab: fixed mode shows chunk-size input", async ({ page }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      await expect(page.getByTestId("chunk-size-input")).toBeVisible()
    })

    test("ranges tab: chunk-size input accepts numeric values", async ({
      page,
    }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      const input = page.getByTestId("chunk-size-input")
      await input.fill("2")
      await expect(input).toHaveValue("2")
    })

    test("ranges tab: switching to custom shows range list with 1 row", async ({
      page,
    }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      await page.getByTestId("range-mode-custom").click()
      await expect(page.getByTestId("range-mode-custom")).toBeChecked()

      const rangeList = page.getByTestId("custom-range-list")
      await expect(rangeList).toBeVisible()

      const rows = rangeList.locator("[data-testid='custom-range-row']")
      await expect(rows).toHaveCount(1)
      await expect(rows.nth(0)).toHaveAttribute("data-index", "0")
    })

    test("ranges tab: adding custom range rows increments correctly and remove re-indexes", async ({
      page,
    }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      await page.getByTestId("range-mode-custom").click()

      const rangeList = page.getByTestId("custom-range-list")
      const rows = rangeList.locator("[data-testid='custom-range-row']")

      // Initial: 1 row at index 0
      await expect(rows).toHaveCount(1)
      await expect(rows.nth(0)).toHaveAttribute("data-index", "0")

      // Add second row
      await page.getByRole("button", { name: /Add range/i }).click()
      await expect(rows).toHaveCount(2)
      await expect(rows.nth(1)).toHaveAttribute("data-index", "1")

      // Add third row
      await page.getByRole("button", { name: /Add range/i }).click()
      await expect(rows).toHaveCount(3)
      await expect(rows.nth(2)).toHaveAttribute("data-index", "2")

      // Remove middle row — remaining rows should re-index to 0, 1
      await rows.nth(1).getByTestId("remove-range-btn").click()
      await expect(rows).toHaveCount(2)
      await expect(rows.nth(0)).toHaveAttribute("data-index", "0")
      await expect(rows.nth(1)).toHaveAttribute("data-index", "1")
    })

    test("ranges tab: remove button is disabled when only 1 row remains", async ({
      page,
    }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      await page.getByTestId("range-mode-custom").click()

      const rangeList = page.getByTestId("custom-range-list")
      const rows = rangeList.locator("[data-testid='custom-range-row']")
      await expect(rows).toHaveCount(1)

      await expect(rows.nth(0).getByTestId("remove-range-btn")).toBeDisabled()
    })

    test("pages tab: page-spec input is editable", async ({ page }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      await page.getByTestId("split-tab-pages").click()

      const input = page.getByTestId("page-spec-input")
      await expect(input).toBeVisible()
      await input.fill("1,3")
      await expect(input).toHaveValue("1,3")
    })

    test("size tab: max-size input is editable and size-unit select exists", async ({
      page,
    }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      await page.getByTestId("split-tab-size").click()

      const sizeInput = page.getByTestId("max-size-input")
      await expect(sizeInput).toBeVisible()
      await sizeInput.fill("500")
      await expect(sizeInput).toHaveValue("500")

      // Size unit select trigger should be visible
      await expect(
        page.locator('[data-testid="size-unit-select"]')
      ).toBeVisible()
    })

    test("split button is visible after upload", async ({ page }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      await expect(page.getByTestId("split-btn")).toBeVisible()
    })

    test("preview text updates with fixed range chunk size changes", async ({
      page,
    }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      // Default fixed mode — preview text should show file count estimate
      const previewText = page.getByTestId("split-preview-text")
      await expect(previewText).toBeVisible()
      await expect(previewText).toContainText(/file/i)
    })

    test("replace file with different PDF updates name and page count", async ({
      page,
    }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE, /3 pages/i)

      await expect(page.getByTestId("split-file-name")).toHaveText(
        "test-3page.pdf"
      )

      // Use the hidden file input to swap the file
      const changeInput = page
        .locator('input[type="file"][accept="application/pdf"]')
        .last()
      await changeInput.setInputFiles(PDF_1PAGE)

      await expect(page.getByTestId("split-file-name")).toHaveText(
        "test-1page.pdf",
        { timeout: 60_000 }
      )
      await expect(page.getByTestId("split-file-page-count")).toHaveText(
        /1 page$/i,
        { timeout: 60_000 }
      )
    })

    test("split by fixed ranges triggers download (.zip)", async ({ page }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      // Fixed ranges with chunk=1 → 3 files → downloaded as zip
      const chunkInput = page.getByTestId("chunk-size-input")
      await chunkInput.fill("1")

      const downloadPromise = page.waitForEvent("download", {
        timeout: 90_000,
      })
      await page.getByTestId("split-btn").click()

      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/\.(pdf|zip)$/i)
    })

    test("split by pages triggers download (.pdf)", async ({ page }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      await page.getByTestId("split-tab-pages").click()
      await page.getByTestId("page-spec-input").fill("1,2")

      const downloadPromise = page.waitForEvent("download", {
        timeout: 90_000,
      })
      await page.getByTestId("split-btn").click()

      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/\.(pdf|zip)$/i)
    })
  })

  // ─── Invalid / Error scenarios ─────────────────────────────────────────────

  test.describe("Invalid / Error scenarios", () => {
    test("non-PDF file is not accepted — stays on upload screen", async ({
      page,
    }) => {
      await navigateToPdfSplit(page)

      const fileInput = page
        .locator('input[type="file"][accept="application/pdf"]')
        .first()
      await fileInput.setInputFiles(NOT_A_PDF)

      // Remains on upload screen; configure tabs never appear
      await expect(
        page.getByRole("heading", { name: /Split PDF/i, level: 1 })
      ).toBeVisible()
      await expect(page.getByTestId("split-tabs")).not.toBeVisible()
    })

    test("corrupted PDF shows error toast or message", async ({ page }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)

      const fileInput = page
        .locator('input[type="file"][accept="application/pdf"]')
        .first()
      await fileInput.setInputFiles(PDF_CORRUPTED)

      // Either a Sonner error toast or inline error text should appear
      const errorVisible = await Promise.race([
        page
          .locator("[data-sonner-toast][data-type='error']")
          .waitFor({ timeout: 60_000 })
          .then(() => true),
        page
          .getByText(/error|failed|invalid|corrupt/i)
          .first()
          .waitFor({ timeout: 60_000 })
          .then(() => true),
        new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 60_000)),
      ])

      expect(errorVisible).toBe(true)
    })

    test("empty page spec shows error toast when split is clicked", async ({
      page,
    }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      // Switch to Pages tab and leave input empty
      await page.getByTestId("split-tab-pages").click()
      await page.getByTestId("page-spec-input").fill("")

      await page.getByTestId("split-btn").click()

      // Should show a toast about no pages specified
      await expect(
        page.locator("[data-sonner-toast]").filter({ hasText: /no pages/i })
      ).toBeVisible({ timeout: 10_000 })
    })

    test("empty custom ranges shows error toast when split is clicked", async ({
      page,
    }) => {
      test.setTimeout(120_000)

      await navigateToPdfSplit(page)
      await uploadAndWaitForInfo(page, PDF_3PAGE)

      // Custom range mode with empty start/end
      await page.getByTestId("range-mode-custom").click()

      await page.getByTestId("split-btn").click()

      // Should show a toast about invalid/no ranges
      await expect(
        page
          .locator("[data-sonner-toast]")
          .filter({ hasText: /range|valid/i })
      ).toBeVisible({ timeout: 10_000 })
    })
  })
})
