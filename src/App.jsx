import { useState, useEffect } from "react"
import Notification from "./components/Notification"
import Blog from "./components/Blog"
import Togglable from "./components/Togglable"
import BlogForm from "./components/BlogForm"
import blogService from "./services/blogs"
import loginService from "./services/login"

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [notificationStatus, setNotificationStatus] = useState(false)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogs = await blogService.getAll()
        const sortedBlogs = blogs.sort((a, b) => b.likes - a.likes)
        setBlogs(sortedBlogs)
      } catch (error) {
        console.error("Failed to fetch blogs:", error)
      }
    }
    fetchBlogs()
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem("loggedBlogappUser")
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()

    try {
      const user = await loginService.login({
        username,
        password,
      })
      window.localStorage.setItem("loggedBlogappUser", JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername("")
      setPassword("")
    } catch (exception) {
      setNotificationMessage("Wrong username or password")
      setNotificationStatus(false)
      setTimeout(() => {
        setNotificationMessage(null)
      }, 5000)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem("loggedBlogappUser", JSON.stringify(user))
    setUser(null)

    setNotificationMessage("user logged out!")
    setNotificationStatus(true)
    setTimeout(() => {
      setNotificationMessage(null)
    }, 5000)
  }

  const handleAddBlog = async (blogObject) => {
    try {
      const createdBlog = await blogService.create(blogObject)

      setBlogs(blogs.concat(createdBlog))
      setNotificationMessage(
        `a new blog ${createdBlog.title} by ${createdBlog.author} added`
      )
      setNotificationStatus(true)
      setTimeout(() => {
        setNotificationMessage(null)
      }, 5000)
    } catch (error) {
      setNotificationMessage(error.response.data.error)
      setNotificationStatus(false)
      setTimeout(() => {
        setNotificationMessage(null)
      }, 5000)
    }
  }

  const incrementBlogLikes = async (blogObject) => {
    try {
      const updatedBlog = await blogService.update(blogObject)
      setBlogs((prevBlogs) =>
        prevBlogs
          .map((blog) => (blog.id === updatedBlog.id ? updatedBlog : blog))
          .sort((a, b) => b.likes - a.likes)
      )
    } catch (error) {
      console.log(error.response.data.error)
    }
  }

  const removeBlog = async (id) => {
    try {
      await blogService.remove(id)
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id))

      setNotificationMessage("blog deleted")
      setNotificationStatus(false)
      setTimeout(() => {
        setNotificationMessage(null)
      }, 5000)
    } catch (error) {
      console.log(error.response.data.error)
    }
  }

  // render functions
  const loginForm = () => (
    <div>
      <h3>log in to application</h3>
      <form onSubmit={handleLogin}>
        <div>
          username
          <input
            type="text"
            value={username}
            name="username"
            onChange={({ target }) => setUsername(target.value)}
          />
          password
          <input
            type="password"
            value={password}
            name="password"
            onChange={({ target }) => setPassword(target.value)}
          />
        </div>
        <button type="submit">login</button>
      </form>
    </div>
  )

  const createForm = () => {
    return (
      <Togglable buttonLabel="new blog">
        <BlogForm createBlog={handleAddBlog} />
      </Togglable>
    )
  }

  const userState = () => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <p>{user.name} logged in</p>
      <button onClick={handleLogout}>logout</button>
    </div>
  )

  const showBlogs = () => (
    <div>
      {blogs.map((blog) => (
        <Blog
          key={blog.id}
          blog={blog}
          onLike={incrementBlogLikes}
          onRemove={removeBlog}
        />
      ))}
    </div>
  )

  return (
    <div>
      <h2>blogs</h2>
      <Notification message={notificationMessage} status={notificationStatus} />

      {!user && loginForm()}
      {user && (
        <div>
          {userState()}
          {createForm()}
          {showBlogs()}
        </div>
      )}
    </div>
  )
}

export default App
