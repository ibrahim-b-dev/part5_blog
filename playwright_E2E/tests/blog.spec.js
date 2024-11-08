const { describe, beforeEach, test, expect } = require("@playwright/test")
const { loginWith, createBlog } = require("./helper")

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    await request.post("/api/testing/reset")
    await request.post("/api/users", {
      data: {
        name: "Ibrahim Dev",
        username: "ibrahim",
        password: "123",
      },
    })

    await page.goto("/")
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
      await loginWith(page, "ibrahim", "123")
    })

    test("a new blog can be created", async ({ page }) => {
      await expect(page.getByRole("button", { name: "new blog" })).toBeVisible()
      await page.getByRole("button", { name: "new blog" }).click()

      await expect(page.getByRole("button", { name: "create" })).toBeVisible()

      await createBlog(page, {
        title: "playwright is awesome",
        author: "ibrahim",
        url: "www.localhost.com/url",
      })

      const successDiv = await page.locator(".success")
      await expect(successDiv).toContainText(
        "a new blog playwright is awesome by ibrahim added"
      )

      await expect(page.getByRole("button", { name: "view" })).toBeVisible()
    })

    test("a blog can be liked", async ({ page }) => {
      await page.getByRole("button", { name: "new blog" }).click()

      await createBlog(page, {
        title: "playwright is awesome",
        author: "ibrahim",
        url: "www.localhost.com/url",
      })

      const viewButton = await page.getByRole("button", { name: "view" })
      await expect(viewButton).toBeVisible()
      await viewButton.click()

      await expect(page.getByText("create new")).toBeVisible()
      const likesElement = await page.getByTestId("likes")
      const initialLikes = parseInt(await likesElement.textContent(), 0)

      await page.getByRole("button", { name: "like" }).click()
      await expect(likesElement).toHaveText((initialLikes + 1).toString())
    })
  })
})
