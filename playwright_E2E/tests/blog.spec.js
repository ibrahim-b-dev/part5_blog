const { describe, beforeEach, test, expect } = require("@playwright/test")
const { loginWith, createBlog, createUser } = require("./helper")

describe("Blog app", () => {
  beforeEach(async ({ page, request }) => {
    await request.post("/api/testing/reset")

    await createUser(request, {
      name: "Ibrahim Dev",
      username: "ibrahim",
      password: "123",
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

    test("user who added the blog can delete the blog", async ({ page }) => {
      await expect(page.getByRole("button", { name: "new blog" })).toBeVisible()
      await page.getByRole("button", { name: "new blog" }).click()

      await createBlog(page, {
        title: "learn react native",
        author: "ibrahim",
        url: "www.localhost.com/react-native",
      })

      await expect(
        page.getByText("www.localhost.com/react-native")
      ).not.toBeVisible()

      await page.getByRole("button", { name: "view" }).click()

      const deleteButton = page.getByRole("button", { name: "remove" })
      await expect(deleteButton).toBeVisible()

      await deleteButton.click()

      const errorDiv = await page.locator(".error")
      await expect(errorDiv).toContainText("blog deleted")
    })

    test(" only the user who added the blog sees the blog's delete button", async ({
      page,
      request,
    }) => {
      await request.post("/api/testing/reset")

      await request.post("/api/users", {
        data: {
          name: "Creator User",
          username: "creator",
          password: "creatorpass",
        },
      })

      // await request.post("/api/users", {
      //   data: {
      //     name: "Other User",
      //     username: "otheruser",
      //     password: "otherpass",
      //   },
      // })

      // await page.getByTestId("username").fill("creator")
      // await page.getByTestId("password").fill("creatorpass")
      // await page.getByRole("button", { name: "login" }).click()

      // Log in as the creator and add a blog
      // await page.goto("/")

      // // Create a new blog
      // await expect(page.getByRole("button", { name: "new blog" })).toBeVisible()
      // await page.getByRole("button", { name: "new blog" }).click()
      // // await page.getByRole("button", { name: "new blog" }).click()
      // await page.getByTestId("title").fill("Test Blog")
      // await page.getByTestId("author").fill("Test Author")
      // await page.getByTestId("url").fill("http://testurl.com")
      // await page.getByRole("button", { name: "create" }).click()

      // Ensure the creator can see the delete button
      // await expect(page.getByText("Test Blog")).toBeVisible()
      // await page.getByRole("button", { name: "view" }).click()
      // await expect(page.getByRole("button", { name: "remove" })).toBeVisible()

      // Log out
      // await page.getByRole("button", { name: "logout" }).click()

      // Log in as a different user
      // await page.getByTestId("username").fill("otheruser")
      // await page.getByTestId("password").fill("otherpass")
      // await page.getByRole("button", { name: "login" }).click()

      // Check that the delete button is not visible
      // await expect(page.getByText("Test Blog")).toBeVisible()
      // await page.getByRole("button", { name: "view" }).click()
      // await expect(
      //   page.getByRole("button", { name: "remove" })
      // ).not.toBeVisible()
    })

    test.only("shows delete button to blog creator only", async ({
      page,
      request,
    }) => {
      await page.goto("/")

      // create test user
      await createUser(request, {
        name: "Other User",
        username: "otheruser",
        password: "otherpass",
      })

      // Log in as the creator and add a blog
      await loginWith(page, "otheruser", "otherpass")

      await page.getByRole("button", { name: "new blog" }).click()

      // Create a new blog
      await createBlog(page, {
        title: "Test Blog",
        author: "Test Author",
        url: "http://testurl.com",
      })

      // Ensure the creator can see the delete button
      await page.getByRole("button", { name: "view" }).click()
      await expect(page.getByRole("button", { name: "remove" })).toBeVisible()

      // Log out
      await page.getByRole("button", { name: "logout" }).click()

      // Log in as a different user
      await loginWith(page, "ibrahim", "123")

      // Check that the delete button is not visible
      await page.getByRole("button", { name: "view" }).click()
      await expect(page.getByText("Test Blog")).toBeVisible()
      await expect(
        page.getByRole("button", { name: "remove" })
      ).not.toBeVisible()
    })
  })
})
