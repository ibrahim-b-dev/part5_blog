import { useState } from "react"

const Blog = ({ blog, onLike, onRemove }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  }

  const [visible, setVisible] = useState(false)

  const handleVisibility = () => {
    setVisible(!visible)
  }

  const handleLikeClick = () => {
    onLike({
      user: blog.user.id,
      likes: blog.likes + 1,
      author: blog.author,
      title: blog.title,
      url: blog.url,
      id: blog.id,
    })
  }
  const handleRemoveClick = () => {
    onRemove(blog.id)
  }

  return (
    <div style={blogStyle}>
      <div>
        {blog.title}
        <button onClick={handleVisibility}>view</button>
      </div>

      <div style={{ display: visible ? "" : "none" }}>
        <div>{blog.url}</div>
        <div>
          {blog.likes}
          <button onClick={handleLikeClick}>like</button>
        </div>
        <div>{blog.author}</div>
        <button onClick={handleRemoveClick}>remove</button>
      </div>
    </div>
  )
}

export default Blog
