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

  describe("When logged in", () => {
    beforeEach(async ({ page }) => {
      await page.getByTestId("username").fill("ibrahim")
      await page.getByTestId("password").fill("123")
      await page.getByRole("button", { name: "login" }).click()
    })

    test("a new blog can be created", async ({ page }) => {
      await expect(page.getByRole("button", { name: "new blog" })).toBeVisible()
      await page.getByRole("button", { name: "new blog" }).click()

      await expect(page.getByRole("button", { name: "create" })).toBeVisible()

      await page.getByTestId("title").fill("playwright is awesome")
      await page.getByTestId("author").fill("ibrahim")
      await page.getByTestId("url").fill("www.localhost.com/url")

      await page.getByRole("button", { name: "create" }).click()

      const successDiv = await page.locator(".success")
      await expect(successDiv).toContainText(
        "a new blog playwright is awesome by ibrahim added"
      )

      await page.waitForTimeout(5000)

      await page.pause()
      await expect(page.getByRole("button", { name: "view" })).toBeVisible()
      await expect(page.getByText("playwright is awesome")).toBeVisible()
    })
  })
})
