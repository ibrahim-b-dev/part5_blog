import { useState, useEffect } from "react"
import Notification from "./components/Notification"
import Blog from "./components/Blog"
import blogService from "./services/blogs"
import loginService from "./services/login"

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [notificationMessage, setNotificationMessage] = useState(null)
  const [notificationStatus, setNotificationStatus] = useState(false)
  const [user, setUser] = useState(null)
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [url, setUrl] = useState("")

  const [loginVisible, setLoginVisible] = useState(false)

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogs = await blogService.getAll()
        setBlogs(blogs)
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

  const handleCreate = async (event) => {
    event.preventDefault()

    try {
      const createdBlog = await blogService.create({
        author,
        title,
        url,
      })

      setBlogs(blogs.concat(createdBlog))
      setTitle("")
      setAuthor("")
      setUrl("")

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
    const hideWhenVisible = { display: loginVisible ? "none" : "" }
    const showWhenVisible = { display: loginVisible ? "" : "none" }

    return (
      <div>
        <div style={hideWhenVisible}>
          <button onClick={() => setLoginVisible(true)}>create note</button>
        </div>

        <div style={showWhenVisible}>
          <h2>create new</h2>
          <form onSubmit={handleCreate}>
            <div>
              title
              <input
                type="text"
                value={title}
                name="title"
                onChange={({ target }) => setTitle(target.value)}
              />
            </div>
            <div>
              author
              <input
                type="text"
                value={author}
                name="author"
                onChange={({ target }) => setAuthor(target.value)}
              />
            </div>
            <div>
              url
              <input
                type="text"
                value={url}
                name="url"
                onChange={({ target }) => setUrl(target.value)}
              />
            </div>
            <button type="submit">create</button>
          </form>
          <button onClick={() => setLoginVisible(false)}>cancel</button>
        </div>
      </div>
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
        <Blog key={blog.id} blog={blog} />
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
