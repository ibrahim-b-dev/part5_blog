const { describe, beforeEach, test, expect } = require("@playwright/test")

describe("Blog app", () => {
  beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173/")
  })

  test("login form is shown", async ({ page }) => {
    const locator = await page.getByText("blogs")
    await expect(locator).toBeVisible()

    await expect(page.getByText("log in to application")).toBeVisible()

    await expect(page.getByText("username")).toBeVisible()
    await expect(page.getByText("password")).toBeVisible()
    await expect(page.getByRole("button", { name: "login" })).toBeVisible()

    await expect(page.locator("form")).toBeVisible()
  })
})
