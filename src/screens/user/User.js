import './User.css'
import { useState, useEffect} from 'react'
import { Link, useParams } from 'react-router-dom'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import CallIcon from '@material-ui/icons/Call'
import CallEndIcon from '@material-ui/icons/CallEnd'
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined'
import PersonAddDisabledIcon from '@material-ui/icons/PersonAddDisabled'
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import SendIcon from '@material-ui/icons/Send';
import CloseIcon from '@material-ui/icons/Close'
import Message from '../../components/message/Message'
import { CometChat } from '@cometchat-pro/chat'
import { cometChat } from '../../app.config'
import { Avatar, Button } from '@material-ui/core'
import { Editor } from '@tinymce/tinymce-react';


function User() {
  const { id } = useParams()
  const [user, setUser] = useState(null)
  const [messages, setMessages] = useState([])
  const [users, setUsers] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [keyword, setKeyword] = useState(null)
  const [message, setMessage] = useState('')
  const [searching, setSearching] = useState(false)
  const [toggle, setToggle] = useState(false)
  const [calling, setCalling] = useState(false)
  const [sessionID, setSessionID] = useState('')
  const [isIncomingCall, setIsIncomingCall] = useState(false)
  const [isOutgoingCall, setIsOutgoingCall] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [editorKey, setEditorKey] =useState(4);// eslint-disable-next-line 
  const theme = useTheme();
  const [open, setOpen] =useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };


  const drawerWidth = 270;

  const useStyles = makeStyles((theme) => ({
    root: {
      display: 'flex',
    },
    appBar: {
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
    },
    appBarShift: {
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['margin', 'width'], {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: drawerWidth,
    },
    title: {
      flexGrow: 1,
    },
    hide: {
      display: 'none',
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    drawerHeader: {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(0, 1),
      // necessary for content to be below app bar
      ...theme.mixins.toolbar,
      justifyContent: 'flex-start',
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginRight: -drawerWidth,
    },
    contentShift: {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginRight: 0,
    },
  }));

  const classes = useStyles();
  
  // eslint-disable-next-line 
  const togglerDetail = () => {
    setToggle(!toggle)
  }
  
  const findUser = (e) => {
    e.preventDefault()
    searchTerm(keyword)
  }

  const clearEditor = () => {
    const newKey = editorKey * 43;
    setEditorKey(newKey);
    }

  const searchTerm = (keyword) => {
    setSearching(true)
    const limit = 30
    const usersRequest = new CometChat.UsersRequestBuilder()
      .setLimit(limit)
      .setSearchKeyword(keyword)
      .build()

    usersRequest
      .fetchNext()
      .then((userList) => {
        setUsers(userList)
        setSearching(false)
      })
      .catch((error) => {
        console.log('User list fetching failed with error:', error)
        setSearching(false)
      })
  }

  const getUser = (UID) => {
    CometChat.getUser(UID)
      .then((user) => setUser(user))
      .catch((error) => {
        console.log('User details fetching failed with error:', error)
      })
  }

  const getMessages = (uid) => {
    const limit = 50

    const messagesRequest = new CometChat.MessagesRequestBuilder()
      .setLimit(limit)
      .setUID(uid)
      .build()

    messagesRequest
      .fetchPrevious()
      .then((msgs) => {
        setMessages(msgs.filter((m) => m.type === 'text'))
        scrollToEnd()
      })
      .catch((error) =>
        console.log('Message fetching failed with error:', error)
      )
  }

  const listenForMessage = (listenerID) => {
    CometChat.addMessageListener(
      listenerID,
      new CometChat.MessageListener({
        onTextMessageReceived: (message) => {
          setMessages((prevState) => [...prevState, message])
          scrollToEnd()
        },
      })
    )
  }

  const listenForCall = (listnerID) => {
    CometChat.addCallListener(
      listnerID,
      new CometChat.CallListener({
        onIncomingCallReceived(call) {
          console.log('Incoming call:', call)
          // Handle incoming call
          setSessionID(call.sessionId)
          setIsIncomingCall(true)
          setCalling(true)
        },
        onOutgoingCallAccepted(call) {
          console.log('Outgoing call accepted:', call)
          // Outgoing Call Accepted
          startCall(call)
        },
        onOutgoingCallRejected(call) {
          console.log('Outgoing call rejected:', call)
          // Outgoing Call Rejected
          setIsIncomingCall(false)
          setIsOutgoingCall(false)
          setCalling(false)
        },
        onIncomingCallCancelled(call) {
          console.log('Incoming call calcelled:', call)
          setIsIncomingCall(false)
          setIsIncomingCall(false)
          setCalling(false)
        },
      })
    )
  }

  const listFriends = () => {
    const limit = 10
    const usersRequest = new CometChat.UsersRequestBuilder()
      .setLimit(limit)
      .friendsOnly(true)
      .build()

    usersRequest
      .fetchNext()
      .then((userList) => setUsers(userList))
      .catch((error) => {
        console.log('User list fetching failed with error:', error)
      })
  }

  const remFriend = (uid, fid) => {
    if (window.confirm('Are you sure?')) {
      const url = `https://api-us.cometchat.io/v2.0/users/${uid}/friends`
      const options = {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          appId: cometChat.APP_ID,
          apiKey: cometChat.REST_KEY,
        },
        body: JSON.stringify({ friends: [fid] }),
      }

      fetch(url, options)
        .then(() => {
          const index = users.findIndex(user => user.uid === fid)
          users.splice(index, 1)
          alert('Friend Removed successfully!')
        })
        .catch((err) => console.error('error:' + err))
    }
  }

  const addFriend = (uid) => {
    const user = JSON.parse(localStorage.getItem('user'))

    const url = `https://api-us.cometchat.io/v2.0/users/${user.uid}/friends`
    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        appId: cometChat.APP_ID,
        apiKey: cometChat.REST_KEY,
      },
      body: JSON.stringify({ accepted: [uid] }),
    }
    fetch(url, options)
      .then(() => {
        setToggle(false)
        alert('Added as friend successfully')
      })
      .catch((err) => console.error('error:' + err))
  }

  const scrollToEnd = () => {
    const elmnt = document.getElementById('messages-container')
    elmnt.scrollTop = elmnt.scrollHeight
  }

  const onSubmit = (e) => {
    e.preventDefault()
    sendMessage(id, message)
    clearEditor()
    
  }

  const sendMessage = (uid, message) => {
    const receiverID = uid
    const messageText = message
    const receiverType = CometChat.RECEIVER_TYPE.USER
    const textMessage = new CometChat.TextMessage(
      receiverID,
      messageText,
      receiverType
    )

    CometChat.sendMessage(textMessage)
      .then((message) => {
        setMessages((prevState) => [...prevState, message])
        setMessage('')
        scrollToEnd()
        
      })
      .catch((error) =>
        console.log('Message sending failed with error:', error)
      )
  }

  const initiateCall = () => {
    const receiverID = id //The uid of the user to be called
    const callType = CometChat.CALL_TYPE.VIDEO
    const receiverType = CometChat.RECEIVER_TYPE.USER

    const call = new CometChat.Call(receiverID, callType, receiverType)

    CometChat.initiateCall(call)
      .then((outGoingCall) => {
        console.log('Call initiated successfully:', outGoingCall)
        // perform action on success. Like show your calling screen.
        setSessionID(outGoingCall.sessionId)
        setIsOutgoingCall(true)
        setCalling(true)
      })
      .catch((error) => {
        console.log('Call initialization failed with exception:', error)
      })
  }

  const startCall = (call) => {
    const sessionId = call.sessionId
    const callType = call.type
    const callSettings = new CometChat.CallSettingsBuilder()
      .setSessionID(sessionId)
      .enableDefaultLayout(true)
      .setIsAudioOnlyCall(callType === 'audio' ? true : false)
      .build()

    setSessionID(sessionId)
    setIsOutgoingCall(false)
    setIsIncomingCall(false)
    setCalling(false)
    setIsLive(true)

    CometChat.startCall(
      callSettings,
      document.getElementById('callScreen'),
      new CometChat.OngoingCallListener({
        onUserJoined: (user) => {
          /* Notification received here if another user joins the call. */
          console.log('User joined call:', user)
          /* this method can be use to display message or perform any actions if someone joining the call */
        },
        onUserLeft: (user) => {
          /* Notification received here if another user left the call. */
          console.log('User left call:', user)
          /* this method can be use to display message or perform any actions if someone leaving the call */
        },
        onUserListUpdated: (userList) => {
          console.log('user list:', userList)
        },
        onCallEnded: (call) => {
          /* Notification received here if current ongoing call is ended. */
          console.log('Call ended:', call)
          /* hiding/closing the call screen can be done here. */
          setIsIncomingCall(false)
          setIsOutgoingCall(false)
          setCalling(false)
          setIsLive(false)
        },
        onError: (error) => {
          console.log('Error :', error)
          /* hiding/closing the call screen can be done here. */
        },
        onMediaDeviceListUpdated: (deviceList) => {
          console.log('Device List:', deviceList)
        },
      })
    )

  }

  const acceptCall = (sessionID) => {
    CometChat.acceptCall(sessionID)
      .then((call) => {
        console.log('Call accepted successfully:', call)
        // start the call using the startCall() method
        startCall(call)
      })
      .catch((error) => {
        console.log('Call acceptance failed with error', error)
        // handle exception
      })
  }

  const rejectCall = (sessionID) => {
    const status = CometChat.CALL_STATUS.REJECTED

    CometChat.rejectCall(sessionID, status)
      .then((call) => {
        console.log('Call rejected successfully', call)
        setCalling(false)
        setIsIncomingCall(false)
        setIsOutgoingCall(false)
        setIsLive(false)
      })
      .catch((error) => {
        console.log('Call rejection failed with error:', error)
      })
  }

  const endCall = (sessionID) => {
    CometChat.endCall(sessionID)
      .then((call) => {
        console.log('call ended', call)
        setCalling(false)
        setIsIncomingCall(false)
        setIsIncomingCall(false)
      })
      .catch((error) => {
        console.log('error', error)
      })
  }

  useEffect(() => {
    getUser(id)
    getMessages(id)
    listenForMessage(id)
    listenForCall(id)
    listFriends(id)

    setCurrentUser(JSON.parse(localStorage.getItem('user')))
    // eslint-disable-next-line
  }, [id])

  return (
    <Box component="div"  className="user">
      {calling ? (
        <div className="callScreen">
          <div className="callScreen__container">
            <div className="call-animation">
              <img
                className="img-circle"
                src={user?.avatar}
                alt=""
                width="135"
              />
            </div>
            {isOutgoingCall ? (
              <h4>Calling {user?.name}</h4>
            ) : (
              <h4>{user?.name} Calling</h4>
            )}

            {isIncomingCall ? (
              <div className="callScreen__btns">
                <Button onClick={() => acceptCall(sessionID)}>
                  <CallIcon />
                </Button>
                <Button onClick={() => rejectCall(sessionID)}>
                  <CallEndIcon />
                </Button>
              </div>
            ) : (
              <div className="callScreen__btns">
                <Button onClick={() => endCall(sessionID)}>
                  <CallEndIcon />
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        ''
      )}
      <div className="user__chat">
        <div className="user__header">
          <div className="user__headerLeft">
            <h4 className="user__userName">
              <strong className={user?.status === 'online' ? 'isOnline' : ''}>
                <FiberManualRecordIcon />
                {user?.name}
              </strong>
            </h4>
          </div>
          <div className="user__headerRight">
            <div style={{marginTop:10}}>
              <IconButton color="inherit"
                style={{width:22,height:22,paddingBottom:22}} >
              <CallIcon onClick={initiateCall} />
              </IconButton>
            <IconButton
                color="inherit"
                style={{width:22,height:22,marginLeft:10,paddingBottom:22}} 
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerOpen}
                className={clsx(open && classes.hide)}
              >
                <InfoOutlinedIcon/>
              </IconButton>
            </div>
              <div className={classes.root}>
                <main style={{padding:0}}
                  className={clsx(classes.content, {
                    [classes.contentShift]: open,
                  })}
                >
                  <div className={classes.drawerHeader} />

                </main>
                <Drawer
                  className={classes.drawer}
                  variant="persistent"
                  anchor="right"
                  open={open}
                  classes={{
                    paper: classes.drawerPaper,
                  }}
                >
                  <div className={classes.drawerHeader}>
                    <div>
                        <div className="user__header">
                          <div className="user__headerLeft">
                            <h4 className="user__userName">
                              <strong style={{textTransform:'none',marginTop:15,marginBottom:15}}>Details</strong>
                            </h4>
                          </div>
                          <div className="user__headerRight" style={{marginRight:5}}>
                            <CloseIcon onClick={handleDrawerClose}/>
                          </div>
                        </div>
                        <div className="user__detailsBody">
                          <div className="user__detailsIdentity">
                            <img src={user?.avatar} alt={user?.name} />
                            <h4 className={user?.status === 'online' ? 'isOnline' : ''}>
                              {user?.name}
                              <FiberManualRecordIcon />
                            </h4>
                          </div>
                          <div className="user__detailsActions">
                            <span>
                              <PersonAddOutlinedIcon onClick={() => addFriend(user?.uid)} />
                              Add
                            </span>
                            <span>
                              <CallIcon  onClick={initiateCall} />
                              Call
                            </span>
                            <span>
                            <PersonAddDisabledIcon
                                    onClick={() => remFriend(id, user?.uid)}
                              />
                              Remove
                            </span>
                          </div>
                          <form onSubmit={(e) => findUser(e)} className="user__detailsForm">
                            <input
                              placeholder="Search for a user"
                              onChange={(e) => setKeyword(e.target.value)}
                              required
                            />
                            <Button style={{marginLeft:5}} onClick={(e) => findUser(e)}>
                              {!searching ? 'Find' : <div id="loading"></div>}
                            </Button>
                          </form>
                          <hr />
                          <div className="user__detailsMembers">
                            <h4>Friends</h4>
                            {users.map((user) => (
                              <div
                                key={user?.uid}
                                className={`available__member ${
                                  user?.status === 'online' ? 'isOnline' : ''
                                }`}
                              >
                                <Avatar src={user?.avatar} alt={user?.name} />
                                <Link to={`/users/${user?.uid}`}>{user?.name}</Link>
                                <FiberManualRecordIcon />
                                {currentUser?.uid.toLowerCase() === id.toLowerCase() ? (
                                  <PersonAddDisabledIcon
                                    onClick={() => remFriend(id, user?.uid)}
                                  />
                                ) : (
                                  ''
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                    </div>
                  </div>
                </Drawer>
              </div>
          </div>
      </div>

        <div id="messages-container" className="user__messages">
          {messages.map((message) => (
            <Message
              uid={message?.sender.uid}
              name={message.sender?.name}
              avatar={message.sender?.avatar}
              message={message?.text}
              timestamp={message?.sentAt}
              key={message?.sentAt}
            />
          ))}
        </div>

        <div className="user__chatInput">
        <Box component="form">
          <Box width={{xs:350,sm:400,md:1000,lg:1000,xl:1000}}>
              <Editor key={editorKey}
                    apiKey="ayidc0ao36vpduw8cvevrpurygt76f8gmwv4sdcw5keq875y"
                
                  init={{
                    height: 120,
                    placeholder:`Send Message to Friend`,
                    menubar: false,
                    resize: false,
                    plugins: [
                      'advlist autolink lists link emoticons image', 
                      'charmap print preview anchor help',
                      'searchreplace visualblocks code',
                      'insertdatetime media table paste wordcount'
                    ],
                    toolbar:// eslint-disable-next-line
                      'undo redo | bold italic emoticons| \
                      alignleft aligncenter alignright | \
                      bullist numlist|image |help',
                      
                      image_title: true,

                      automatic_uploads: true,

                      file_picker_types: 'image file media',

                      file_picker_callback: function (cb, value, meta) {
                        var input = document.createElement('input');
                        input.setAttribute('type', 'file');
                        input.setAttribute('accept', 'image/*');

                        input.onchange = function () {
                          var file = this.files[0];

                          var reader = new FileReader();
                          reader.onload = function () {
                            
                            var id = 'blobid' + (new Date()).getTime();
                            var blobCache =  window.tinymce.activeEditor.editorUpload.blobCache;
                            var base64 = reader.result.split(',')[1];
                            var blobInfo = blobCache.create(id, file, base64);
                            blobCache.add(blobInfo);

                            cb(blobInfo.blobUri(), { title: file.name });
                          };
                          reader.readAsDataURL(file);
                        };

                        input.click();
                      },

                  }}
                  onChange={(e) => setMessage(e.target.getContent())}
                />
          </Box>
            <button type="submit" onClick={(e) => onSubmit(e)}>
            <SendIcon/>
            </button>
        </Box>
        </div>
      </div>
      {isLive ? <div style={{maxHeight:'92%',maxWidth:1200}} id="callScreen"></div> : ''}

    </Box>
  )
}

export default User
