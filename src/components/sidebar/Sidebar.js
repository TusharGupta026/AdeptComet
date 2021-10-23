import './Sidebar.css'
import React from 'react';
import { useState, useEffect } from 'react'
import { auth } from '../../firebase'
import SidebarOption from '../sidebarOption/SidebarOption'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import AddIcon from '@material-ui/icons/Add'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import AccessibilityIcon from '@material-ui/icons/Accessibility';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import ChatIcon from '@material-ui/icons/Chat';
import { CometChat } from '@cometchat-pro/chat'
import Button from '@material-ui/core/Button';
import { Link, useHistory } from 'react-router-dom'

import PropTypes from 'prop-types';
import AppBar from '@material-ui/core/AppBar';
import Drawer from '@material-ui/core/Drawer';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Toolbar from '@material-ui/core/Toolbar';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Header from '../Header/Header'

function Sidebar(props) {

  const [open, setOpen] = React.useState(true);

  const drawerWidth = 260;

  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    drawer: {
      [theme.breakpoints.up('sm')]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    appBar: {
      [theme.breakpoints.up('sm')]: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
      },
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    // necessary for content to be below app bar
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
      width: drawerWidth,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
  }));

  const { window } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };



  const container = window !== undefined ? () => window().document.body : undefined;

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

  const drawer = (
    <div className="sidebar">      
          <div className="sidebar__header">
            <div className="sidebar__info">
              <h2>
                <Link to="/">Adept</Link>
              </h2>
              <h3>
                <FiberManualRecordIcon />
                Welcome ,{user?.displayName.split(' ')[0]}
              </h3>
            </div>
            </div>
            <div className="sidebar__options">
              <hr />
            <List>
              <ListItem style={{paddingLeft:0 ,paddingTop:0,paddingBottom:0}}  className="dropdown" button onClick={handleClick}>
                <Button  style={{color:'white',textTransform:'none'}}>
                  <ChatIcon style={{paddingRight:10,width:25,height:25}}/> Channels
                </Button>
                {open ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={open} timeout="auto" unmountOnExit>
                <List key={channels.guid}  component="div">
                  <hr />
                  {channels.map((channel) =>
                      <ListItem style={{paddingLeft:0 ,paddingTop:0,paddingBottom:0}}  button>
                        <SidebarOption
                          title={channel.name}
                          id={channel.guid}
                          key={channel.guid}
                          sub="sidebarOption__sub"
                        />         
                      </ListItem>
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
              <Button  style={{color:'white',textTransform:'none'}}>
                <AccessibilityIcon style={{paddingRight:10,width:25,height:25}}/> Direct Messages
              </Button>
              {openDirect ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse style={{paddingBottom:10}} in={openDirect} timeout="auto" unmountOnExit>
              <List key={dms.uid} component="div">
                <hr />
                {dms.map((dm) => (
                  <ListItem style={{paddingLeft:0 ,paddingTop:3,paddingBottom:0}} button>
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
  );

  return (
    <div className={classes.root}>
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar  style={{paddingRight:0,minHeight:0,paddingLeft:0,backgroundColor:'#49274b'}}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          style={{marginRight:0,padding:10,borderRadius:25,backgroundColor:"#49274b"}}
          onClick={handleDrawerToggle}
          className={classes.menuButton}
        >
          <MenuIcon />
        </IconButton>
        <Header/>
      </Toolbar>
    </AppBar>
    <nav className={classes.drawer}>
      {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
      <Hidden smUp implementation="css">
        <Drawer
          container={container}
          variant="temporary"
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open={mobileOpen}
          onClose={handleDrawerToggle}
          classes={{
            paper: classes.drawerPaper,
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          style={{overflowY:'auto'}}
        >
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden xsDown implementation="css">
        <Drawer
          classes={{
            paper: classes.drawerPaper,
          }}
          style={{overflowY:'auto'}}
          variant="permanent"
          open
        >
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  </div>
  )
}

Sidebar.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default Sidebar
