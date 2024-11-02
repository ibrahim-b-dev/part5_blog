import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Blog from "./Blog"
import BlogForm from "./BlogForm"

describe("<Blog />", () => {
  test("renders blog title, but does not display URL or likes by default", () => {
    const blog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
    }

    // Render the Blog component
    const { container } = render(
      <Blog blog={blog} onLike={() => {}} onRemove={() => {}} />
    )

    // Select the div containing content that should be visible by default
    const visibleContent = container.querySelector(".visibleContent")
    // Assert that the visible content section is actually visible to the user
    expect(visibleContent).toBeVisible()

    // Find the title element by its text content
    const title = screen.getByText("Canonical string reduction")
    // Verify that the title is within the visible content section
    expect(visibleContent).toContainElement(title)

    // Select the div containing hidden content
    const hiddenContent = container.querySelector(".hiddenContent")
    // Assert that the hidden content section is not visible by default
    expect(hiddenContent).not.toBeVisible()

    // Find the parent div by its test ID to confirm hierarchical structure
    const parentDiv = screen.getByTestId("parent-div")
    // Check that the hidden content is indeed a child of the parent div
    expect(parentDiv).toContainElement(hiddenContent)

    // Find the author element by the blog’s author text
    const author = screen.getByText(blog.author)
    // Verify that the author is within the hidden content section
    expect(hiddenContent).toContainElement(author)

    // Find the URL element by the blog's URL text
    const url = screen.getByText(blog.url)
    // Ensure that the URL is part of the hidden content section
    expect(hiddenContent).toContainElement(url)

    // Find the likes element by the blog's likes count
    const likes = screen.getByText(blog.likes)
    // Confirm that the likes count is also within the hidden content section
    expect(hiddenContent).toContainElement(likes)
  })

  test("displays URL and likes when the details button is clicked", async () => {
    const blog = {
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
      likes: 12,
    }

    const mockVieweHandler = vi.fn()
    const { container } = render(
      <Blog blog={blog} onLike={() => {}} onRemove={() => {}} />
    )

    const visibleContent = container.querySelector(".visibleContent")
    expect(visibleContent).toBeVisible()

    const hiddenContent = container.querySelector(".hiddenContent")
    expect(hiddenContent).not.toBeVisible()

    const user = userEvent.setup()
    const viewButton = screen.getByText("view")

    expect(visibleContent).toContainElement(viewButton)
    await user.click(viewButton)
    expect(hiddenContent).toBeVisible()

    const url = screen.getByText(blog.url)
    expect(hiddenContent).toContainElement(url)

    const likes = screen.getByText(blog.likes)
    expect(hiddenContent).toContainElement(likes)
  })

  test("calls event handler twice if like button is clicked twice", async () => {
    const blog = {
      title: "Test Blog",
      author: "Jane Doe",
      url: "http://example.com",
      likes: 0,
      user: {
        id: 1,
      },
    }
    const mockLikeHandler = vi.fn()

    const { container } = render(
      <Blog blog={blog} onLike={mockLikeHandler} onRemove={() => {}} />
    )

    const user = userEvent.setup()
    const likeButton = screen.getByText("like")

    await user.click(likeButton)
    await user.click(likeButton)

    expect(mockLikeHandler).toHaveBeenCalledTimes(2)
  })

  test("calls event handler with correct details when a new blog is created", async () => {
    const mockCreateHandler = vi.fn()
    const { container } = render(<BlogForm createBlog={mockCreateHandler} />)

    const user = userEvent.setup()

    const titleInput = container.querySelector('input[name="title"]')
    const authorInput = container.querySelector('input[name="author"]')
    const urlInput = container.querySelector('input[name="url"]')
    const submitButton = screen.getByText("create")

    await user.type(titleInput, "New Blog Title")
    await user.type(authorInput, "Author Name")
    await user.type(urlInput, "http://example.com")

    await user.click(submitButton)

    expect(mockCreateHandler).toHaveBeenCalledTimes(1)
    expect(mockCreateHandler).toHaveBeenCalledWith({
      title: "New Blog Title",
      author: "Author Name",
      url: "http://example.com",
    })
  })
})
