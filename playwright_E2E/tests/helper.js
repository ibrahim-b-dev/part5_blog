const loginWith = async (page, username, password) => {
  await page.getByTestId("username").fill(username)
  await page.getByTestId("password").fill(password)
  await page.getByRole("button", { name: "login" }).click()
}

const createBlog = async (page, content) => {
  const { title, author, url } = content

  await page.getByTestId("title").fill(title)
  await page.getByTestId("author").fill(author)
  await page.getByTestId("url").fill(url)
  await page.getByRole("button", { name: "create" }).click()
}

const createUser = async (request, { name, username, password }) => {
  const userPayload = { name, username, password }
  await request.post("/api/users", { data: userPayload })
}

const likeABlog = async (page, blogTitle, likesCount) => {
  const blog = page.locator(".blog").filter({ hasText: blogTitle })
  await blog.getByRole("button", { name: "view" }).click()

  for (let i = 0; i < likesCount; i++) {
    await blog.getByTestId("likeButton").click()
    await page.waitForTimeout(1000)
  }
}

export { loginWith, createBlog, createUser, likeABlog }
