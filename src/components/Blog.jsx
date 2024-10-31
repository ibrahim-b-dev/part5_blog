import { useState } from "react"

const Blog = ({ blog }) => {
  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: "solid",
    borderWidth: 1,
    marginBottom: 5,
  }

  const [visible, setVisible] = useState(false)

  const changeVisibility = () => {
    console.log("cahnges visible", visible)

    setVisible(!visible)
  }

  return (
    <div style={blogStyle}>
      <div>
        {blog.title}
        <button onClick={changeVisibility}>view</button>
      </div>

      <div style={{ display: visible ? "" : "none" }}>
        <div>{blog.url}</div>
        <div>
          {blog.likes}
          <button onClick={() => null}>like</button>
        </div>
        <div>{blog.author}</div>
      </div>
    </div>
  )
}

export default Blog
