import './Message.css'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar } from '@material-ui/core'
import Moment from 'react-moment'
import 'moment-timezone'
import parse from 'html-react-parser';

function Message({ uid, name, avatar, message, timestamp }) {
  const [hovered, setHovered] = useState(false)
  const toggleHover = () => setHovered(!hovered)

  // Moment.globalTimezone = 'America/Los_Angeles'

  return (
    <div
      className="message"
      onMouseEnter={toggleHover}
      onMouseLeave={toggleHover}
    >
      <div className="message__data">
        <div className="message__left">
          <Avatar
            className="message__avatar"
            src={avatar}
            alt={`${name} ${uid} - Image`}
          />
        </div>
        <div className="message__right">
          <div className="message__details">
            <Link to={`/users/${uid}`}>{name}</Link>
            <small>
              <Moment unix date={timestamp} format="YY-MM-D H:mm " />
            </small>
          </div>
          <div className="message__text">{parse(message)}</div>
        </div>
      </div>
    </div>
  )
}

export default Message
