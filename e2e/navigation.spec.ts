import { test, expect } from "@playwright/test"
import { navigateToHome, waitForAppReady } from "./helpers/navigation"

test.describe("Navigation & Layout", () => {
  test("home page loads with correct title and heading", async ({ page }) => {
    await navigateToHome(page)

    await expect(page).toHaveTitle(/Perotron Web/)
    await expect(
      page.getByRole("heading", { name: /Perotron Web/i, level: 1 })
    ).toBeVisible()
  })

  test("header contains brand logo linking to home", async ({ page }) => {
    await page.goto("/pdf/merge")
    await waitForAppReady(page)

    const logoLink = page.locator("header a").filter({ hasText: "Perotron Web" })
    await expect(logoLink).toBeVisible()
    await logoLink.click()
    await expect(page).toHaveURL("/")
  })

  test("desktop nav links navigate to correct pages", async ({ page }) => {
    await navigateToHome(page)

    // PDF Tools link
    const pdfLink = page.locator("header nav").getByRole("link", { name: "PDF Tools" })
    await expect(pdfLink).toBeVisible()
    await pdfLink.click()
    await expect(page).toHaveURL("/pdf")

    // QR Tools link
    const qrLink = page.locator("header nav").getByRole("link", { name: "QR Tools" })
    await expect(qrLink).toBeVisible()
    await qrLink.click()
    await expect(page).toHaveURL("/qr")
  })

  test("footer contains Privacy Policy and Terms links", async ({ page }) => {
    await navigateToHome(page)

    const footer = page.locator("footer")
    await expect(footer.getByRole("link", { name: "Privacy Policy" })).toBeVisible()
    await expect(footer.getByRole("link", { name: "Terms of Use" })).toBeVisible()
  })

  test("footer contains GitHub link", async ({ page }) => {
    await navigateToHome(page)

    const githubLink = page.locator("footer").getByRole("link", { name: "GitHub" })
    await expect(githubLink).toBeVisible()
    await expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/naveen521kk/perotron-web"
    )
  })

  test("footer displays version number", async ({ page }) => {
    await navigateToHome(page)

    const versionLink = page.locator("footer a[aria-label*='Version']")
    await expect(versionLink).toBeVisible()
    await expect(versionLink).toHaveText(/^\s*v\d+\.\d+\.\d+\s*$/)
  })

  test("theme toggle switches between light and dark mode", async ({ page }) => {
    await navigateToHome(page)

    const html = page.locator("html")

    // Open the theme toggle dropdown
    const themeToggle = page.getByRole("button", { name: /toggle theme/i })
    await expect(themeToggle).toBeVisible()
    await themeToggle.click()

    // Select "Dark" from the dropdown
    await page.getByRole("menuitem", { name: /Dark/i }).click()

    // The html element should now have the "dark" class
    await expect(html).toHaveClass(/dark/)

    // Switch back to Light
    await themeToggle.click()
    await page.getByRole("menuitem", { name: /Light/i }).click()

    // Light mode removes the "dark" class; no "light" class is added
    await expect(html).not.toHaveClass(/dark/)
  })

  test("PDF category page lists available PDF tools", async ({ page }) => {
    await page.goto("/pdf")
    await waitForAppReady(page)

    await expect(page.getByText("Merge PDF")).toBeVisible()
    await expect(page.getByText("Split PDF")).toBeVisible()
  })

  test("QR category page lists available QR tools", async ({ page }) => {
    await page.goto("/qr")
    await waitForAppReady(page)

    await expect(page.getByText("QR Code Generator")).toBeVisible()
  })

  test("Privacy Policy page loads", async ({ page }) => {
    await page.goto("/privacy")
    await waitForAppReady(page)

    await expect(page).toHaveTitle(/Privacy/i)
  })

  test("Terms of Use page loads", async ({ page }) => {
    await page.goto("/terms")
    await waitForAppReady(page)

    await expect(page).toHaveTitle(/Terms/i)
  })
})

test.describe("Footer copyright", () => {
  const pages = [
    { name: "Home", path: "/" },
    { name: "PDF category", path: "/pdf" },
    { name: "PDF Merge", path: "/pdf/merge" },
    { name: "PDF Split", path: "/pdf/split" },
    { name: "QR category", path: "/qr" },
    { name: "QR Generator", path: "/qr/generator" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms of Use", path: "/terms" },
  ]

  for (const { name, path } of pages) {
    test(`copyright is present on ${name} page`, async ({ page }) => {
      await page.goto(path)
      await waitForAppReady(page)

      const copyright = page.getByTestId("footer-copyright")
      await expect(copyright).toBeVisible()

      // Should contain the current year
      const currentYear = new Date().getFullYear().toString()
      await expect(copyright).toContainText(currentYear)

      // Should credit the author
      await expect(copyright).toContainText("Naveen M K")

      // Should mention the license
      await expect(copyright).toContainText("GNU AGPLv3")
    })
  }
})
