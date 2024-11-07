const { describe, beforeEach, test, expect } = require("@playwright/test")

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    await request.post("http://localhost:3001/api/testing/reset")
    await request.post("http://localhost:3001/api/users", {
      data: {
        name: "Ibrahim Dev",
        username: "ibrahim",
        password: "123",
      },
    })

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

  describe("Login", () => {
    test("succeeds with correct credentials", async ({ page }) => {
      await page.getByTestId("username").fill("ibrahim")
      await page.getByTestId("password").fill("123")
      await page.getByRole("button", { name: "login" }).click()

      await expect(page.getByText("Ibrahim Dev logged in")).toBeVisible()
      await expect(page.getByRole("button", { name: "new blog" })).toBeVisible()
    })

    test("fails with wrong credentials", async ({ page }) => {
      await page.getByTestId("username").fill("ibrahim")
      await page.getByTestId("password").fill("wrong")
      await page.getByRole("button", { name: "login" }).click()

      const errorDiv = await page.locator(".error")
      await expect(errorDiv).toContainText("Wrong username or password")
    })
  })
})
