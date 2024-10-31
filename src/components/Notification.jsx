const Notification = ({ message, status }) => {
  if (message === null) {
    return null
  }

  const className = status ? "success" : "error"
  return <div className={className}>{message}</div>
}

export default Notification
