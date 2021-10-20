import './Sidebar.css'
import React from 'react';
import { useState, useEffect } from 'react'
import { auth } from '../../firebase'
import SidebarOption from '../sidebarOption/SidebarOption'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import StarBorderIcon from '@material-ui/icons/StarBorder';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import AddIcon from '@material-ui/icons/Add'
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import AccessibilityIcon from '@material-ui/icons/Accessibility';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ChatIcon from '@material-ui/icons/Chat';
import { CometChat } from '@cometchat-pro/chat'
import { Link, useHistory } from 'react-router-dom'

function Sidebar() {

  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  const [openDirect, setDirectOpen] = React.useState(true);
  const handleDirectClick = () => {
    setDirectOpen(!openDirect);
  };

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
    <div  className="sidebar">      
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
    <List component="nav" >
      <ListItem style={{paddingLeft:0 ,paddingTop:0,paddingBottom:0}}  className="dropdown" button onClick={handleClick}>
        <SidebarOption Icon={ChatIcon} title="Channels" />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <hr />
          {channels.map((channel) =>
            channel.type === 'private' ? (
              <ListItem style={{paddingLeft:0 ,paddingTop:0,paddingBottom:0}}  button>
              <SidebarOption
                title={channel.name}
                id={channel.guid}
                key={channel.guid}
                sub="sidebarOption__sub"
              />
              </ListItem>

            ) : (
              <ListItem style={{paddingLeft:0 ,paddingTop:0,paddingBottom:0}}  button>
              <SidebarOption
                title={channel.name}
                id={channel.guid}
                key={channel.guid}
                sub="sidebarOption__sub"
              />
              </ListItem>
            )
          )}

          <SidebarOption
            Icon={AddIcon}
            title="Add Channel"
            sub="sidebarOption__sub"
            addChannelOption
          />
        </List>
      </Collapse>
    </List>
      <hr />
    <List >
      <ListItem style={{paddingLeft:0 ,paddingTop:0,paddingBottom:0}} className="dropdown" button onClick={handleDirectClick}>
        <SidebarOption Icon={AccessibilityIcon} title="Direct Messages" />
        {openDirect ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={openDirect} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          <hr />
          {dms.map((dm) => (
            <ListItem style={{paddingLeft:0 ,paddingTop:0,paddingBottom:0}} button>
              <SidebarOption
                Icon={FiberManualRecordIcon}
                title={dm.name}
                id={dm.uid}
                key={dm.uid}
                sub="sidebarOption__sub sidebarOption__color"
                user
                online={dm.status === 'online' ? 'isOnline' : ''}
              />
            </ListItem>  
        ))}
        </List>
      </Collapse>
    </List>
    </div>

      <button className="sidebar__logout" onClick={logOut}>
        Logout
      </button>
    </div>
  )
}


export default Sidebar
