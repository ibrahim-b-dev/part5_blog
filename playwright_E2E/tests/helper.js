const loginWith = async (page, username, password) => {
  await page.getByTestId("username").fill("ibrahim")
  await page.getByTestId("password").fill("123")
  await page.getByRole("button", { name: "login" }).click()
}

const createBlog = async (page, content) => {
  const { title, author, url } = content

  await page.getByTestId("title").fill(title)
  await page.getByTestId("author").fill(author)
  await page.getByTestId("url").fill(url)
  await page.getByRole("button", { name: "create" }).click()
}

export { loginWith, createBlog }
