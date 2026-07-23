import * as os from "os"
import { test, expect } from "@playwright/test"
import { navigateToQrGenerator } from "./helpers/navigation"
import { decodeDownloadedQr } from "./helpers/qr-decode"

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Fill the URL input and wait for the QR canvas to appear. */
async function fillUrlAndWaitForCanvas(
  page: Parameters<typeof navigateToQrGenerator>[0],
  url = "https://example.com"
) {
  const urlInput = page.locator("#qr-url")
  await urlInput.fill(url)
  await expect(
    page.getByTestId("qr-canvas-container").locator("canvas")
  ).toBeVisible({ timeout: 5_000 })
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

test.describe("QR Code Generator", () => {
  // ─── Page load ─────────────────────────────────────────────────────────────

  test.describe("Page load", () => {
    test("renders with correct title and h1", async ({ page }) => {
      await navigateToQrGenerator(page)

      await expect(page).toHaveTitle(/QR Code Generator/i)
      await expect(
        page.getByRole("heading", { name: /QR Code Generator/i, level: 1 })
      ).toBeVisible()
    })

    test("has correct canonical URL", async ({ page }) => {
      await navigateToQrGenerator(page)

      const canonical = page.locator('link[rel="canonical"]')
      await expect(canonical).toHaveAttribute(
        "href",
        "https://tools.naveenmk.me/qr/generator/"
      )
    })

    test("all four accordion sections are visible", async ({ page }) => {
      await navigateToQrGenerator(page)

      await expect(
        page.getByRole("button", { name: /Content/i })
      ).toBeVisible()
      await expect(page.getByRole("button", { name: /Style/i })).toBeVisible()
      await expect(page.getByRole("button", { name: /Logo/i })).toBeVisible()
      await expect(
        page.getByRole("button", { name: /Advanced/i })
      ).toBeVisible()
    })

    test("preview panel and QR canvas container are present on load", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      await expect(page.getByTestId("preview-panel")).toBeVisible()
      await expect(
        page.getByTestId("qr-canvas-container").locator("canvas")
      ).toBeVisible({ timeout: 5_000 })
    })

    test("privacy badge reads 'Client-side'", async ({ page }) => {
      await navigateToQrGenerator(page)

      await expect(page.getByTestId("privacy-badge")).toContainText(
        "Client-side"
      )
    })
  })

  // ─── Content type tabs ─────────────────────────────────────────────────────

  test.describe("Content type tabs", () => {
    test("URL tab is active by default and shows url input", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      const urlTab = page.getByTestId("content-tab-url")
      await expect(urlTab).toHaveAttribute("data-active", "true")
      await expect(page.locator("#qr-url")).toBeVisible()
    })

    test("content-type-tabs container renders URL, Text, WiFi and More buttons", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      const tabs = page.getByTestId("content-type-tabs")
      await expect(tabs.getByTestId("content-tab-url")).toBeVisible()
      await expect(tabs.getByTestId("content-tab-text")).toBeVisible()
      await expect(tabs.getByTestId("content-tab-wifi")).toBeVisible()
      await expect(tabs.getByTestId("content-tab-more")).toBeVisible()
    })

    test("switching to Text tab shows textarea and marks tab active", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      await page.getByTestId("content-tab-text").click()

      await expect(page.locator("#qr-text")).toBeVisible()
      await expect(page.locator("#qr-url")).not.toBeVisible()
      await expect(page.getByTestId("content-tab-text")).toHaveAttribute(
        "data-active",
        "true"
      )
      await expect(page.getByTestId("content-tab-url")).toHaveAttribute(
        "data-active",
        "false"
      )
    })

    test("switching to WiFi tab shows SSID, password, encryption and hidden checkbox", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      await page.getByTestId("content-tab-wifi").click()

      await expect(page.locator("#wifi-ssid")).toBeVisible()
      await expect(page.locator("#wifi-pass")).toBeVisible()
      await expect(page.locator("#wifi-enc")).toBeVisible()
      await expect(page.locator("#wifi-hidden")).toBeVisible()
    })

    test("WiFi hidden-network checkbox toggles on click", async ({ page }) => {
      await navigateToQrGenerator(page)
      await page.getByTestId("content-tab-wifi").click()

      const hiddenCheckbox = page.locator("#wifi-hidden")
      await expect(hiddenCheckbox).not.toBeChecked()
      await hiddenCheckbox.click()
      await expect(hiddenCheckbox).toBeChecked()
    })

    test("WiFi encryption select has WPA, WEP and None options", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)
      await page.getByTestId("content-tab-wifi").click()

      await page.locator("#wifi-enc").click()
      await expect(
        page.getByRole("option", { name: /WPA\/WPA2/i })
      ).toBeVisible()
      await expect(page.getByRole("option", { name: /WEP/i })).toBeVisible()
      await expect(
        page.getByRole("option", { name: /None \(Open\)/i })
      ).toBeVisible()
    })

    test("vCard tab opens from More dropdown and shows all vCard fields", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      await page.getByTestId("content-tab-more").click()
      await page.getByTestId("content-tab-vcard").click()

      await expect(page.locator("#vc-first")).toBeVisible()
      await expect(page.locator("#vc-last")).toBeVisible()
      await expect(page.locator("#vc-org")).toBeVisible()
      await expect(page.locator("#vc-title")).toBeVisible()
      await expect(page.locator("#vc-phone")).toBeVisible()
      await expect(page.locator("#vc-email")).toBeVisible()
      await expect(page.locator("#vc-url")).toBeVisible()
      await expect(page.locator("#vc-address")).toBeVisible()
    })

    test("WhatsApp tab opens from More dropdown and shows phone and message fields", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      await page.getByTestId("content-tab-more").click()
      await page.getByTestId("content-tab-whatsapp").click()

      await expect(page.locator("#wa-phone")).toBeVisible()
      await expect(page.locator("#wa-msg")).toBeVisible()
    })
  })

  // ─── QR code rendering ─────────────────────────────────────────────────────

  test.describe("QR code rendering", () => {
    test("URL input renders QR canvas", async ({ page }) => {
      await navigateToQrGenerator(page)
      await fillUrlAndWaitForCanvas(page)
    })

    test("Text input renders QR canvas", async ({ page }) => {
      await navigateToQrGenerator(page)

      await page.getByTestId("content-tab-text").click()
      await page.locator("#qr-text").fill("Hello, Perotron Web!")

      await expect(
        page.getByTestId("qr-canvas-container").locator("canvas")
      ).toBeVisible({ timeout: 5_000 })
    })

    test("WiFi SSID input renders QR canvas", async ({ page }) => {
      await navigateToQrGenerator(page)

      await page.getByTestId("content-tab-wifi").click()
      await page.locator("#wifi-ssid").fill("MyTestNetwork")

      await expect(
        page.getByTestId("qr-canvas-container").locator("canvas")
      ).toBeVisible({ timeout: 5_000 })
    })

    test("vCard first name input renders QR canvas", async ({ page }) => {
      await navigateToQrGenerator(page)

      await page.getByTestId("content-tab-more").click()
      await page.getByTestId("content-tab-vcard").click()
      await page.locator("#vc-first").fill("Jane")

      await expect(
        page.getByTestId("qr-canvas-container").locator("canvas")
      ).toBeVisible({ timeout: 5_000 })
    })

    test("WhatsApp phone input renders QR canvas", async ({ page }) => {
      await navigateToQrGenerator(page)

      await page.getByTestId("content-tab-more").click()
      await page.getByTestId("content-tab-whatsapp").click()
      await page.locator("#wa-phone").fill("14155550199")

      await expect(
        page.getByTestId("qr-canvas-container").locator("canvas")
      ).toBeVisible({ timeout: 5_000 })
    })

    test("very long text still renders QR canvas", async ({ page }) => {
      await navigateToQrGenerator(page)

      await page.getByTestId("content-tab-text").click()
      await page.locator("#qr-text").fill("A".repeat(500))

      await expect(
        page.getByTestId("qr-canvas-container").locator("canvas")
      ).toBeVisible({ timeout: 10_000 })
    })
  })

  // ─── Style options ─────────────────────────────────────────────────────────

  test.describe("Style options", () => {
    test("dot-type-toggle renders all 6 shape options", async ({ page }) => {
      await navigateToQrGenerator(page)

      const group = page.getByTestId("dot-type-toggle")
      await expect(group).toBeVisible()

      const expectedValues = [
        "square",
        "dots",
        "rounded",
        "extra-rounded",
        "classy",
        "classy-rounded",
      ]
      for (const v of expectedValues) {
        await expect(group.getByTestId(`dot-type-${v}`)).toBeVisible()
      }
    })

    test("clicking a dot-type option keeps canvas visible", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)
      await fillUrlAndWaitForCanvas(page)

      await page.getByTestId("dot-type-dots").click()

      await expect(
        page.getByTestId("qr-canvas-container").locator("canvas")
      ).toBeVisible()
    })

    test("corner-square-toggle renders Square, Dot and Rounded options", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      const group = page.getByTestId("corner-square-toggle")
      await expect(group.getByTestId("corner-square-square")).toBeVisible()
      await expect(group.getByTestId("corner-square-dot")).toBeVisible()
      await expect(
        group.getByTestId("corner-square-extra-rounded")
      ).toBeVisible()
    })

    test("corner-dot-toggle renders Square and Dot options", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      const group = page.getByTestId("corner-dot-toggle")
      await expect(group.getByTestId("corner-dot-square")).toBeVisible()
      await expect(group.getByTestId("corner-dot-dot")).toBeVisible()
    })

    test("color picker inputs are present for dot, corner square, corner dot and background", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      for (const id of [
        "dot-color",
        "corner-square-color",
        "corner-dot-color",
        "background-color",
      ]) {
        await expect(page.getByTestId(`color-picker-${id}`)).toBeVisible()
      }
    })

    test("dot color hex input accepts a new value", async ({ page }) => {
      await navigateToQrGenerator(page)

      const hexInput = page.getByTestId("color-input-dot-color")
      await expect(hexInput).toBeVisible()
      await hexInput.fill("#ff0000")
      await expect(hexInput).toHaveValue("#ff0000")
    })

    test("background color hex input accepts a new value", async ({ page }) => {
      await navigateToQrGenerator(page)

      const hexInput = page.getByTestId("color-input-background-color")
      await expect(hexInput).toBeVisible()
      await hexInput.fill("#ffffff")
      await expect(hexInput).toHaveValue("#ffffff")
    })
  })

  // ─── Logo options ──────────────────────────────────────────────────────────

  test.describe("Logo options", () => {
    test("example logos grid renders exactly 6 logo buttons", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      const grid = page.getByTestId("example-logos")
      await expect(grid).toBeVisible()
      await expect(grid.locator("button")).toHaveCount(7)
    })

    test("each example logo button is visible by testid", async ({ page }) => {
      await navigateToQrGenerator(page)

      for (const name of [
        "perotron",
        "github",
        "x",
        "linkedin",
        "instagram",
        "youtube",
        "whatsapp",
      ]) {
        await expect(page.getByTestId(`logo-example-${name}`)).toBeVisible()
      }
    })

    test("selecting GitHub logo marks it selected and shows Remove button", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      const githubBtn = page.getByTestId("logo-example-github")
      await expect(githubBtn).toHaveAttribute("data-selected", "false")

      await githubBtn.click()

      await expect(githubBtn).toHaveAttribute("data-selected", "true")
      await expect(page.getByTestId("logo-remove-btn")).toBeVisible()
    })

    test("removing logo hides Remove button and logo sliders", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      await page.getByTestId("logo-example-github").click()
      await expect(page.getByTestId("logo-size-value")).toBeVisible()

      await page.getByTestId("logo-remove-btn").click()

      await expect(page.getByTestId("logo-remove-btn")).not.toBeVisible()
      await expect(page.getByTestId("logo-size-value")).not.toBeVisible()
      await expect(
        page.getByTestId("logo-example-github")
      ).toHaveAttribute("data-selected", "false")
    })

    test("logo size and margin sliders are visible after selecting a logo", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      await page.getByTestId("logo-example-linkedin").click()

      await expect(page.getByTestId("logo-size-slider")).toBeVisible()
      await expect(page.getByTestId("logo-margin-slider")).toBeVisible()
      await expect(page.getByTestId("logo-size-value")).toBeVisible()
      await expect(page.getByTestId("logo-margin-value")).toBeVisible()
    })

    test("upload logo button is visible", async ({ page }) => {
      await navigateToQrGenerator(page)

      await expect(page.getByTestId("logo-upload-btn")).toBeVisible()
    })
  })

  // ─── Advanced options ──────────────────────────────────────────────────────

  test.describe("Advanced options", () => {
    test("error correction radio group renders L, M, Q and H options", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      const group = page.getByTestId("error-correction-group")
      await expect(group).toBeVisible()

      for (const level of ["L", "M", "Q", "H"]) {
        await expect(page.locator(`#ec-${level}`)).toBeVisible()
      }
    })

    test("default error correction level is H", async ({ page }) => {
      await navigateToQrGenerator(page)

      await expect(page.locator("#ec-H")).toBeChecked()
    })

    test("clicking H sets error correction to M and deselects H", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      await page.getByTestId("ec-label-M").click()

      await expect(page.locator("#ec-M")).toBeChecked()
      await expect(page.locator("#ec-H")).not.toBeChecked()
    })

    test("QR size value label is visible with px suffix", async ({ page }) => {
      await navigateToQrGenerator(page)

      await expect(page.getByTestId("qr-size-value")).toContainText("px")
    })

    test("QR margin value label is visible with px suffix", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      await expect(page.getByTestId("qr-margin-value")).toContainText("px")
    })
  })

  // ─── Download ──────────────────────────────────────────────────────────────

  test.describe("Download", () => {
    test("download-image-btn and download-svg-btn are present", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)

      await expect(page.getByTestId("download-image-btn")).toBeVisible()
      await expect(page.getByTestId("download-svg-btn")).toBeVisible()
    })

    test("opening download dropdown exposes PNG and JPEG menu items", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)
      await fillUrlAndWaitForCanvas(page)

      await page.getByTestId("download-image-btn").click()

      await expect(page.getByTestId("download-png")).toBeVisible()
      await expect(page.getByTestId("download-jpeg")).toBeVisible()
    })

    test("PNG download triggers file with .png extension", async ({ page }) => {
      await navigateToQrGenerator(page)
      await fillUrlAndWaitForCanvas(page)

      const downloadPromise = page.waitForEvent("download", {
        timeout: 10_000,
      })
      await page.getByTestId("download-image-btn").click()
      await page.getByTestId("download-png").click()

      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/\.png$/i)
    })

    test("JPEG download triggers file with .jpeg extension", async ({
      page,
    }) => {
      await navigateToQrGenerator(page)
      await fillUrlAndWaitForCanvas(page)

      const downloadPromise = page.waitForEvent("download", {
        timeout: 10_000,
      })
      await page.getByTestId("download-image-btn").click()
      await page.getByTestId("download-jpeg").click()

      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/\.jpeg$/i)
    })

    test("SVG download triggers file with .svg extension", async ({ page }) => {
      await navigateToQrGenerator(page)
      await fillUrlAndWaitForCanvas(page)

      const downloadPromise = page.waitForEvent("download", {
        timeout: 10_000,
      })
      await page.getByTestId("download-svg-btn").click()

      const download = await downloadPromise
      expect(download.suggestedFilename()).toMatch(/\.svg$/i)
    })
  })
})

// ─────────────────────────────────────────────────────────────────────────────────
// QR Data Integrity ─ download PNG → decode with jsqr → assert data matches
// ─────────────────────────────────────────────────────────────────────────────────

test.describe("QR data integrity", () => {
    // Each test downloads a PNG and verifies the embedded QR string.
    // WASM + canvas rendering can be slow on CI, so we allow generous timeouts.
    test.setTimeout(60_000)

    /** Helper: fill URL input, wait for canvas, download PNG, decode, return data. */
    async function downloadAndDecode(
      page: Parameters<typeof navigateToQrGenerator>[0]
    ): Promise<string> {
      const downloadPromise = page.waitForEvent("download", { timeout: 30_000 })
      await page.getByTestId("download-image-btn").click()
      await page.getByTestId("download-png").click()
      const download = await downloadPromise
      return decodeDownloadedQr(download, os.tmpdir())
    }

    test("URL QR encodes the entered website URL", async ({ page }) => {
      const targetUrl = "https://example.com"
      await navigateToQrGenerator(page)
      await page.locator("#qr-url").fill(targetUrl)
      await expect(
        page.getByTestId("qr-canvas-container").locator("canvas")
      ).toBeVisible({ timeout: 10_000 })

      const decoded = await downloadAndDecode(page)
      expect(decoded).toBe(targetUrl)
    })

    test("Text QR encodes the entered plain text", async ({ page }) => {
      const text = "Hello, Perotron Web!"
      await navigateToQrGenerator(page)
      await page.getByTestId("content-tab-text").click()
      await page.locator("#qr-text").fill(text)
      await expect(
        page.getByTestId("qr-canvas-container").locator("canvas")
      ).toBeVisible({ timeout: 10_000 })

      const decoded = await downloadAndDecode(page)
      expect(decoded).toBe(text)
    })

    test("WiFi QR encodes the correct WIFI: URI format", async ({ page }) => {
      const ssid = "TestNetwork"
      const password = "s3cretPass"
      await navigateToQrGenerator(page)
      await page.getByTestId("content-tab-wifi").click()
      await page.locator("#wifi-ssid").fill(ssid)
      await page.locator("#wifi-pass").fill(password)
      await expect(
        page.getByTestId("qr-canvas-container").locator("canvas")
      ).toBeVisible({ timeout: 10_000 })

      const decoded = await downloadAndDecode(page)
      // Expected format: WIFI:T:WPA;S:<ssid>;P:<password>;H:false;;
      expect(decoded).toContain(`S:${ssid}`)
      expect(decoded).toContain(`P:${password}`)
      expect(decoded).toMatch(/^WIFI:/)
    })

    test("vCard QR encodes the correct vCard 3.0 data", async ({ page }) => {
      await navigateToQrGenerator(page)
      await page.getByTestId("content-tab-more").click()
      await page.getByTestId("content-tab-vcard").click()
      await page.locator("#vc-first").fill("Jane")
      await page.locator("#vc-last").fill("Doe")
      await page.locator("#vc-org").fill("Acme Corp")
      await page.locator("#vc-phone").fill("+15550001234")
      await page.locator("#vc-email").fill("jane@example.com")
      await expect(
        page.getByTestId("qr-canvas-container").locator("canvas")
      ).toBeVisible({ timeout: 10_000 })

      const decoded = await downloadAndDecode(page)
      expect(decoded).toContain("BEGIN:VCARD")
      expect(decoded).toContain("VERSION:3.0")
      expect(decoded).toContain("N:Doe;Jane")
      expect(decoded).toContain("FN:Jane Doe")
      expect(decoded).toContain("ORG:Acme Corp")
      expect(decoded).toContain("TEL:+15550001234")
      expect(decoded).toContain("EMAIL:jane@example.com")
      expect(decoded).toContain("END:VCARD")
    })

    test("WhatsApp QR encodes the correct wa.me URL with message", async ({
      page,
    }) => {
      const phone = "14155550199"
      const message = "Hello from Perotron!"
      await navigateToQrGenerator(page)
      await page.getByTestId("content-tab-more").click()
      await page.getByTestId("content-tab-whatsapp").click()
      await page.locator("#wa-phone").fill(phone)
      await page.locator("#wa-msg").fill(message)
      await expect(
        page.getByTestId("qr-canvas-container").locator("canvas")
      ).toBeVisible({ timeout: 10_000 })

      const decoded = await downloadAndDecode(page)
      expect(decoded).toContain(`https://wa.me/${phone}`)
      expect(decoded).toContain(encodeURIComponent(message))
    })

    test("WhatsApp QR without message encodes plain wa.me URL", async ({
      page,
    }) => {
      const phone = "14155550199"
      await navigateToQrGenerator(page)
      await page.getByTestId("content-tab-more").click()
      await page.getByTestId("content-tab-whatsapp").click()
      await page.locator("#wa-phone").fill(phone)
      await expect(
        page.getByTestId("qr-canvas-container").locator("canvas")
      ).toBeVisible({ timeout: 10_000 })

      const decoded = await downloadAndDecode(page)
      expect(decoded).toBe(`https://wa.me/${phone}`)
    })
})
