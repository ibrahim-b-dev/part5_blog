import { render, screen } from "@testing-library/react"
import Blog from "./Blog"
import { expect } from "vitest"

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
})
