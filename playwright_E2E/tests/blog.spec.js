const { describe, beforeEach, test, expect } = require("@playwright/test")
const { loginWith, createBlog, createUser, likeABlog } = require("./helper")

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
      await loginWith(page, "ibrahim", "123")

      await expect(page.getByText("Ibrahim Dev logged in")).toBeVisible()
      await expect(page.getByRole("button", { name: "new blog" })).toBeVisible()
    })

    test("fails with wrong credentials", async ({ page }) => {
      await loginWith(page, "ibrahim", "wrong")

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

    test("only the user who added the blog sees the blog's delete button", async ({
      page,
      request,
    }) => {
      test.setTimeout(30000)
      await request.post("/api/testing/reset")

      await createUser(request, {
        name: "Creator User",
        username: "creator",
        password: "creatorpass",
      })

      await page.getByRole("button", { name: "logout" }).click()

      await loginWith(page, "creator", "creatorpass")

      await page.getByRole("button", { name: "new blog" }).click()

      await createBlog(page, {
        title: "Restricted Blog",
        author: "Creator Author",
        url: "http://creator-blog.com",
      })

      await page.getByRole("button", { name: "view" }).click()
      await expect(page.getByRole("button", { name: "remove" })).toBeVisible()

      await page.getByRole("button", { name: "logout" }).click()

      await createUser(request, {
        name: "Other User",
        username: "otheruser",
        password: "otherpass",
      })

      await loginWith(page, "otheruser", "otherpass")

      await page.getByRole("button", { name: "view" }).click()
      await expect(
        page.getByRole("button", { name: "remove" })
      ).not.toBeVisible()
    })

    test("shows delete button to blog creator only", async ({
      page,
      request,
    }) => {
      await page.goto("/")

      await createUser(request, {
        name: "Other User",
        username: "otheruser",
        password: "otherpass",
      })

      await loginWith(page, "otheruser", "otherpass")

      await page.getByRole("button", { name: "new blog" }).click()

      await createBlog(page, {
        title: "Test Blog",
        author: "Test Author",
        url: "http://testurl.com",
      })

      await page.getByRole("button", { name: "view" }).click()
      await expect(page.getByRole("button", { name: "remove" })).toBeVisible()

      await page.getByRole("button", { name: "logout" }).click()

      await loginWith(page, "ibrahim", "123")

      await page.getByRole("button", { name: "view" }).click()
      await expect(page.getByText("Test Blog")).toBeVisible()
      await expect(
        page.getByRole("button", { name: "remove" })
      ).not.toBeVisible()
    })

    test("blogs are ordered by likes in descending order", async ({
      page,
      request,
    }) => {
      test.setTimeout(30000)
      await page.goto("/")

      await createUser(request, {
        name: "Other User",
        username: "otheruser",
        password: "otherpass",
      })

      await loginWith(page, "otheruser", "otherpass")
      await page.getByRole("button", { name: "new blog" }).click()

      const testBlogs = [
        {
          title: "Blog A",
          author: "Author A",
          url: "urlA",
          likes: 5,
        },
        {
          title: "Blog B",
          author: "Author B",
          url: "urlB",
          likes: 7,
        },
        {
          title: "Blog C",
          author: "Author C",
          url: "urlC",
          likes: 3,
        },
      ]

      for (const blog of testBlogs) {
        await createBlog(page, {
          title: blog.title,
          author: blog.author,
          url: blog.url,
        })

        await likeABlog(page, blog.title, blog.likes)
      }

      const blogLikes = await page
        .locator(".blog")
        .evaluateAll((blogs) =>
          blogs.map((blog) =>
            parseInt(
              blog.querySelector("[data-testid='likes']").textContent,
              10
            )
          )
        )

      for (let i = 0; i < blogLikes.length - 1; i++) {
        console.log(blogLikes[i])

        expect(blogLikes[i]).toBeGreaterThanOrEqual(blogLikes[i + 1])
      }
    })
  })
})
