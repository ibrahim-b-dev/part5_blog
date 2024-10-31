import PropTypes from "prop-types"

const Notification = ({ message, status }) => {
  if (message === null) {
    return null
  }

  const className = status ? "success" : "error"
  return <div className={className}>{message}</div>
}

Notification.propTypes = {
  message: PropTypes.string,
  status: PropTypes.bool.isRequired,
}

export default Notification
