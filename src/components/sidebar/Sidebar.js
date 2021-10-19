import './Sidebar.css'
import { useState, useEffect } from 'react'
import { auth } from '../../firebase'
import SidebarOption from '../sidebarOption/SidebarOption'
import CreateIcon from '@material-ui/icons/Create'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import StarBorderIcon from '@material-ui/icons/StarBorder';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import MoreVertIcon from '@material-ui/icons/MoreVert';
import BallotIcon from '@material-ui/icons/Ballot';
import AddIcon from '@material-ui/icons/Add'
import { CometChat } from '@cometchat-pro/chat'
import { Link, useHistory } from 'react-router-dom'

function Sidebar() {
  const [channels, setChannels] = useState([])
  const [user, setUser] = useState(null)
  const [dms, setDms] = useState([])
  const history = useHistory()

  const getDirectMessages = () => {
    const limit = 10
    const usersRequest = new CometChat.UsersRequestBuilder()
      .setLimit(limit)
      .friendsOnly(true)
      .build()

    usersRequest
      .fetchNext()
      .then((userList) => setDms(userList))
      .catch((error) => {
        console.log('User list fetching failed with error:', error)
      })
  }

  const getChannels = () => {
    const limit = 30
    const groupsRequest = new CometChat.GroupsRequestBuilder()
      .setLimit(limit)
      .joinedOnly(true)
      .build()

    groupsRequest
      .fetchNext()
      .then((groupList) => setChannels(groupList))
      .catch((error) => {
        console.log('Groups list fetching failed with error', error)
      })
  }

  const logOut = () => {
    auth
      .signOut()
      .then(() => {
        localStorage.removeItem('user')
        history.push('/login')
      })
      .catch((error) => console.log(error.message))
  }

  useEffect(() => {
    const data = localStorage.getItem('user')
    setUser(JSON.parse(data))

    getChannels()
    getDirectMessages()
  }, [])

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__info">
          <h2>
            <Link to="/">Adept</Link>
          </h2>
          <h3>
            <FiberManualRecordIcon />
            Welcome,{user?.displayName.split(' ')[0]}
          </h3>
        </div>
        <MoreVertIcon/>
      </div>
      <div className="sidebar__options">
        <SidebarOption Icon={StarBorderIcon} title="Starred" />
        <hr />
        <SidebarOption Icon={ArrowDropDownIcon} title="Channels" />
        <hr />
        {channels.map((channel) =>
          channel.type === 'private' ? (
            <SidebarOption
              Icon={BallotIcon}
              title={channel.name}
              id={channel.guid}
              key={channel.guid}
              sub="sidebarOption__sub"
            />
          ) : (
            <SidebarOption
              title={channel.name}
              id={channel.guid}
              key={channel.guid}
              sub="sidebarOption__sub"
            />
          )
        )}

        <SidebarOption
          Icon={AddIcon}
          title="Add Channel"
          sub="sidebarOption__sub"
          addChannelOption
        />
        <hr />
        <SidebarOption Icon={ArrowDropDownIcon} title="Direct Messages" />
        <hr />
        {dms.map((dm) => (
          <SidebarOption
            Icon={FiberManualRecordIcon}
            title={dm.name}
            id={dm.uid}
            key={dm.uid}
            sub="sidebarOption__sub sidebarOption__color"
            user
            online={dm.status === 'online' ? 'isOnline' : ''}
          />
        ))}
      </div>

      <button className="sidebar__logout" onClick={logOut}>
        Logout
      </button>
    </div>
  )
}

export default Sidebar
