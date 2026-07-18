import { test, expect } from "@playwright/test"
import { navigateToPdfMerge, fixturePath } from "./helpers/navigation"
import path from "path"

const PDF_1PAGE = path.resolve(fixturePath("test-1page.pdf"))
const PDF_3PAGE = path.resolve(fixturePath("test-3page.pdf"))
const NOT_A_PDF = path.resolve(fixturePath("not-a-pdf.txt"))

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Upload files via the initial hidden file input and wait for the arrange screen. */
async function uploadAndWaitForArrange(
  page: Parameters<typeof navigateToPdfMerge>[0],
  files: string | string[]
) {
  const fileInput = page
    .locator('input[type="file"][accept="application/pdf"]')
    .first()
  await fileInput.setInputFiles(Array.isArray(files) ? files : [files])
  await expect(page.getByTestId("arrange-heading")).toBeVisible()
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe("PDF Merge Tool", () => {
  // ─── Page load ─────────────────────────────────────────────────────────────

  test.describe("Page load", () => {
    test("renders upload zone with correct title and h1", async ({ page }) => {
      await navigateToPdfMerge(page)

      await expect(page).toHaveTitle(/Merge PDF/i)
      await expect(
        page.getByRole("heading", { name: /Merge PDFs/i, level: 1 })
      ).toBeVisible()
      await expect(page.getByText("Select PDF files")).toBeVisible()
    })

    test("has correct canonical URL", async ({ page }) => {
      await navigateToPdfMerge(page)

      const canonical = page.locator('link[rel="canonical"]')
      await expect(canonical).toHaveAttribute(
        "href",
        "https://tools.naveenmk.me/pdf/merge"
      )
    })
  })

  // ─── Valid scenarios ────────────────────────────────────────────────────────

  test.describe("Valid scenarios", () => {
    test("uploading a single PDF transitions to arrange screen", async ({
      page,
    }) => {
      await navigateToPdfMerge(page)
      await uploadAndWaitForArrange(page, PDF_1PAGE)

      await expect(page.getByTestId("pdf-file-name").first()).toHaveText(
        "test-1page.pdf"
      )
    })

    test("file count in sidebar reflects uploaded file count", async ({
      page,
    }) => {
      await navigateToPdfMerge(page)
      await uploadAndWaitForArrange(page, [PDF_1PAGE, PDF_3PAGE])

      await expect(page.getByTestId("merge-file-count")).toHaveText("2")
    })

    test("uploading multiple PDFs shows all cards in grid", async ({
      page,
    }) => {
      await navigateToPdfMerge(page)
      await uploadAndWaitForArrange(page, [PDF_1PAGE, PDF_3PAGE])

      const grid = page.getByTestId("pdf-file-grid")
      const cards = grid.locator("[data-index]")
      await expect(cards).toHaveCount(2)

      await expect(cards.nth(0).getByTestId("pdf-file-name")).toHaveText(
        "test-1page.pdf"
      )
      await expect(cards.nth(1).getByTestId("pdf-file-name")).toHaveText(
        "test-3page.pdf"
      )
    })

    test("each card shows a file size", async ({ page }) => {
      await navigateToPdfMerge(page)
      await uploadAndWaitForArrange(page, PDF_1PAGE)

      const sizeEl = page.getByTestId("pdf-file-size").first()
      await expect(sizeEl).toBeVisible()
      // Should display bytes/KB/MB unit
      await expect(sizeEl).toContainText(/B|KB|MB/)
    })

    test("cards carry correct data-index attributes", async ({ page }) => {
      await navigateToPdfMerge(page)
      await uploadAndWaitForArrange(page, [PDF_1PAGE, PDF_3PAGE])

      const grid = page.getByTestId("pdf-file-grid")
      const cards = grid.locator("[data-index]")

      await expect(cards.nth(0)).toHaveAttribute("data-index", "0")
      await expect(cards.nth(1)).toHaveAttribute("data-index", "1")
    })

    test("remove individual PDF via remove-file-btn", async ({ page }) => {
      await navigateToPdfMerge(page)
      await uploadAndWaitForArrange(page, [PDF_1PAGE, PDF_3PAGE])

      // Make sure both files are shown
      await expect(page.getByText("test-1page.pdf")).toBeVisible()
      await expect(page.getByText("test-3page.pdf")).toBeVisible()

      // Hover the first card to reveal the remove button, then click it
      const grid = page.getByTestId("pdf-file-grid")
      const firstCard = grid.locator("[data-index]").nth(0)
      await firstCard.hover()
      await firstCard.getByTestId("remove-file-btn").click()

      // First file gone, second still present, count drops to 1
      await expect(page.getByText("test-1page.pdf")).not.toBeVisible()
      await expect(page.getByText("test-3page.pdf")).toBeVisible()
      await expect(page.getByTestId("merge-file-count")).toHaveText("1")
    })

    test("clear all resets to upload screen", async ({ page }) => {
      await navigateToPdfMerge(page)
      await uploadAndWaitForArrange(page, [PDF_1PAGE, PDF_3PAGE])

      await page.getByTestId("clear-all-btn").click()

      // Upload screen heading reappears
      await expect(
        page.getByRole("heading", { name: /Merge PDFs/i, level: 1 })
      ).toBeVisible()
      await expect(page.getByTestId("arrange-heading")).not.toBeVisible()
    })

    test("sort by filename ascending then descending", async ({ page }) => {
      await navigateToPdfMerge(page)
      // Upload in reverse alphabetical order to verify sort actually changes order
      await uploadAndWaitForArrange(page, [PDF_3PAGE, PDF_1PAGE])

      const grid = page.getByTestId("pdf-file-grid")
      const cards = grid.locator("[data-index]")

      // First click: ascending (test-1page before test-3page)
      await page.getByTestId("sort-by-name-btn").click()
      await expect(cards.nth(0).getByTestId("pdf-file-name")).toHaveText(
        "test-1page.pdf"
      )
      await expect(cards.nth(1).getByTestId("pdf-file-name")).toHaveText(
        "test-3page.pdf"
      )

      // Second click: descending (test-3page before test-1page)
      await page.getByTestId("sort-by-name-btn").click()
      await expect(cards.nth(0).getByTestId("pdf-file-name")).toHaveText(
        "test-3page.pdf"
      )
      await expect(cards.nth(1).getByTestId("pdf-file-name")).toHaveText(
        "test-1page.pdf"
      )
    })

    test("sort by file size ascending then descending", async ({ page }) => {
      await navigateToPdfMerge(page)
      // Upload largest first so ascending sort will reorder
      await uploadAndWaitForArrange(page, [PDF_3PAGE, PDF_1PAGE])

      const grid = page.getByTestId("pdf-file-grid")
      const cards = grid.locator("[data-index]")

      // First click: ascending (smallest = 1page first)
      await page.getByTestId("sort-by-size-btn").click()
      await expect(cards.nth(0).getByTestId("pdf-file-name")).toHaveText(
        "test-1page.pdf"
      )
      await expect(cards.nth(1).getByTestId("pdf-file-name")).toHaveText(
        "test-3page.pdf"
      )

      // Second click: descending (largest = 3page first)
      await page.getByTestId("sort-by-size-btn").click()
      await expect(cards.nth(0).getByTestId("pdf-file-name")).toHaveText(
        "test-3page.pdf"
      )
      await expect(cards.nth(1).getByTestId("pdf-file-name")).toHaveText(
        "test-1page.pdf"
      )
    })

    test("add more PDFs via hidden add-more input", async ({ page }) => {
      await navigateToPdfMerge(page)
      await uploadAndWaitForArrange(page, PDF_1PAGE)

      await expect(page.getByTestId("merge-file-count")).toHaveText("1")

      // The hidden second file input is triggered by the "Add more PDFs" button
      const addMoreInput = page
        .locator('input[type="file"][accept="application/pdf"]')
        .last()
      await addMoreInput.setInputFiles(PDF_3PAGE)

      await expect(page.getByTestId("merge-file-count")).toHaveText("2")
      await expect(page.getByText("test-1page.pdf")).toBeVisible()
      await expect(page.getByText("test-3page.pdf")).toBeVisible()
    })

    test("merge button is visible on arrange screen", async ({ page }) => {
      await navigateToPdfMerge(page)
      await uploadAndWaitForArrange(page, [PDF_1PAGE, PDF_3PAGE])

      await expect(page.getByTestId("merge-btn")).toBeVisible()
    })

    test("merge button initiates merge and triggers download of merged.pdf", async ({
      page,
    }) => {
      test.setTimeout(120_000)

      await navigateToPdfMerge(page)
      await uploadAndWaitForArrange(page, [PDF_1PAGE, PDF_3PAGE])

      const downloadPromise = page.waitForEvent("download", {
        timeout: 90_000,
      })

      await page.getByTestId("merge-btn").click()

      // Status message should appear while WASM is loading/merging
      await expect(
        page.getByText(/Initialising|Merging|Reading/i).first()
      ).toBeVisible({ timeout: 30_000 })

      const download = await downloadPromise
      expect(download.suggestedFilename()).toBe("merged.pdf")
    })
  })

  // ─── Invalid / Error scenarios ─────────────────────────────────────────────

  test.describe("Invalid / Error scenarios", () => {
    test("non-PDF file is not added to the grid", async ({ page }) => {
      await navigateToPdfMerge(page)

      const fileInput = page
        .locator('input[type="file"][accept="application/pdf"]')
        .first()
      await fileInput.setInputFiles(NOT_A_PDF)

      // Upload screen stays visible; arrange screen never appears
      await expect(
        page.getByRole("heading", { name: /Merge PDFs/i, level: 1 })
      ).toBeVisible()
      await expect(page.getByTestId("arrange-heading")).not.toBeVisible()
    })
  })
})
