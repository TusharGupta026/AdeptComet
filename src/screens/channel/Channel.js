import './Channel.css'
import { useState, useEffect, useRef} from 'react'
import { Link, useParams, useHistory } from 'react-router-dom'
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined'
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined'
import PersonAddDisabledIcon from '@material-ui/icons/PersonAddDisabled'
import CallIcon from '@material-ui/icons/Call'
import CallEndIcon from '@material-ui/icons/CallEnd'
import SendIcon from '@material-ui/icons/Send';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import Box from '@material-ui/core/Box';
import clsx from 'clsx';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close'
import LockIcon from '@material-ui/icons/Lock'
import Message from '../../components/message/Message'
import { CometChat} from '@cometchat-pro/chat'
import DeleteIcon from '@material-ui/icons/Delete';
import { Avatar, Button } from '@material-ui/core'
import { Editor } from '@tinymce/tinymce-react';
import { GiphyFetch } from "@giphy/js-fetch-api";
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import Dialog from '@material-ui/core/Dialog';
import {
  Gif,
  Grid,
} from "@giphy/react-components";
import ResizeObserver from "react-resize-observer";


const giphyFetch = new GiphyFetch("Qx3DgxdLNWo3hjOk9ukKz4Ydg7BmI5NG");

function GridDemo({ onGifClick }) {
  const fetchGifs = (offset) =>
    giphyFetch.trending({ offset, limit: 10 });
  const [width, setWidth] = useState(window.innerWidth);
  return (
    <>
      <Grid
        onGifClick={onGifClick}
        fetchGifs={fetchGifs}
        width={width}
        columns={3}
        gutter={6}
      />
      <ResizeObserver
        onResize={({ width }) => {
          setWidth(width);
        }}
      />
    </>
  );
}


function Channel() {
  const { id } = useParams()
  const history = useHistory()
  const [channel, setChannel] = useState(null)
  const [messages, setMessages] = useState([])
  const [members, setMembers] = useState([])
  const [users, setUsers] = useState([])
  const [keyword, setKeyword] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [message, setMessage] = useState('')
  const [searching, setSearching] = useState(false)
  const [toggleAdd, setToggleAdd] = useState(false)
  const [calling, setCalling] = useState(false)
  const [sessionID, setSessionID] = useState('')
  const [isIncomingCall, setIsIncomingCall] = useState(false)
  const [isOutgoingCall, setIsOutgoingCall] = useState(false)
  const [isLive, setIsLive] = useState(false)
  const [editorKey, setEditorKey] =useState(4);// eslint-disable-next-line 
  const theme = useTheme();
  const [open, setOpen] =useState(false);
  const [openGif, setGifOpen] =useState(false);
  const [modalGif, setModalGif] = useState();
  const editorRef = useRef(null);
  
  const handleGifClickOpen = () => {
    setGifOpen(true);
  };
  
  const handleGifClose = () => {
    setGifOpen(false);
  };


  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };


  const drawerWidth = 285;

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

  const clearEditor = () => {
    const newKey = editorKey * 43;
    setEditorKey(newKey);
    }
// eslint-disable-next-line 
  const togglerAdd = () => {
    setToggleAdd(!toggleAdd)
  }

  const findUser = (e) => {
    e.preventDefault()

    searchTerm(keyword)
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

  const getMembers = (guid) => {
    const GUID = guid
    const limit = 30
    const groupMemberRequest = new CometChat.GroupMembersRequestBuilder(GUID)
      .setLimit(limit)
      .build()

    groupMemberRequest
      .fetchNext()
      .then((groupMembers) => setMembers(groupMembers))
      .catch((error) => {
        console.log('Group Member list fetching failed with exception:', error)
      })
  }

  const getChannel = (guid) => {
    CometChat.getGroup(guid)
      .then((group) => setChannel(group))
      .catch((error) => {
        if (error.code === 'ERR_GUID_NOT_FOUND') history.push('/')
        console.log('Group details fetching failed with exception:', error)
      })
  }

  const listenForMessage = (listenerID) => {
    CometChat.addMessageListener(
      listenerID,
      new CometChat.MessageListener({
        onTextMessageReceived: (message) => {
          setMessages((prevState) => [...prevState, message])
          scrollToEnd()
        }
      })
    )
  }

  const getMessages = (guid) => {
    const limit = 50

    const messagesRequest = new CometChat.MessagesRequestBuilder()
      .setLimit(limit)
      .setGUID(guid)
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

  const scrollToEnd = () => {
    const elmnt = document.getElementById('messages-container')
    elmnt.scrollTop = elmnt.scrollHeight
  }

  const onSubmit = (e) => {
    e.preventDefault()
    sendMessage(id, message)
    clearEditor()
    
  }

  const sendMessage = (guid, message) => {
    const receiverID = guid
    const messageText = message
    const receiverType = CometChat.RECEIVER_TYPE.GROUP
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

  const addMember = (guid, uid) => {
    let GUID = guid
    let membersList = [
      new CometChat.GroupMember(uid, CometChat.GROUP_MEMBER_SCOPE.PARTICIPANT),
    ]

    CometChat.addMembersToGroup(GUID, membersList, [])
      .then((member) => {
        setMembers((prevState) => [...prevState, member])
        alert('Member added successfully')
      })
      .catch((error) => {
        console.log('Something went wrong', error)
        alert(error.message)
      })
  }

  const remMember = (GUID, UID) => {
    if (channel.scope !== 'admin') return null

    CometChat.kickGroupMember(GUID, UID).then(
      (response) => {
        const index = members.findIndex((member) => member.uid === UID)
        members.splice(index, 1)
        console.log('Group member kicked successfully', response)
        alert('Member removed successfully')
      },
      (error) => {
        console.log('Group member kicking failed with error', error)
      }
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

  const initiateCall = () => {
    const receiverID = id //The uid of the user to be called
    const callType = CometChat.CALL_TYPE.VIDEO
    const receiverType = CometChat.RECEIVER_TYPE.GROUP

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

  const deleteChannel = (GUID) => {
    if (window.confirm('Are you sure?')) {
      CometChat.deleteGroup(GUID).then(
        (response) => {
          console.log('Channel deleted successfully:', response)
          alert('Channel Delete Successfully')
          window.location.href = '/'
        },
        (error) => {
          console.log('Channel delete failed with exception:', error)
          alert('You cannot delete this group you need to ask owner of this group to do that')
        }
      )
    }
  }

  const initiateBoard = (GUID)=>{
    CometChat.callExtension("whiteboard", "POST", "v1/create", { 
      "receiver": GUID,
      "receiverType": "group"
    }).then(response => {
      // Response with board_url
      console.log(response);
      CometChat.getLoggedinUser().then(
        user => {
          // Replace spaces with underscore
          let username = user.name.split(' ').join('_');
          
          // Append the username to the board_url
         let board_url = response + '&username=' + username;
         return board_url;
        },
        error => {
          console.log("error getting details:", { error });
        }
      );
      
    
    })
    .catch(error => {
      // Some error occured
    });

  }


  useEffect(() => {
    getChannel(id)
    getMessages(id)
    getMembers(id)
    initiateBoard(id)
    listenForMessage(id)
    listenForCall(id)
    initiateBoard(id)
    setCurrentUser(JSON.parse(localStorage.getItem('user')))
    // eslint-disable-next-line
  }, [id])

  return (

    <div className="channel">
      {calling ? (
        <div className="callScreen">
          <div className="callScreen__container">
            <div className="call-animation">
              <img
                className="img-circle"
                src={channel?.avatar}
                alt=""
                width="135"
              />
            </div>
            {isOutgoingCall ? (
              <h4>Calling {channel?.name}</h4>
            ) : (
              <h4>{channel?.name} Calling</h4>
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
      <div className="channel__chat">
        <div className="channel__header">
          <div className="channel__headerLeft">
            <h4 className="channel__channelName">
              <strong>
                {channel?.type === 'private' ? '#' : '#'}
                {channel?.name}
              </strong>
            </h4>
          </div>
          <div className="channel__headerRight" >
            <div style={{marginTop:10}}>
  
                <Dialog open={openGif} onClose={handleGifClose}>
                  <DialogTitle>
                    Giphy
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                    <>
                      <GridDemo
                        onGifClick={(gif, e) => {
                          console.log("gif", gif);
                          e.preventDefault();
                          setModalGif(gif);
                        }}
                      />
                      {modalGif && (
                        <div
                          style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            background: "rgba(0, 0, 0, .8)"
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            setModalGif(undefined);
                          }}
                        >
                          <Gif gif={modalGif} width={200} />
                        </div>
                      )} 
                    </>
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleGifClose} color="primary">
                    Cancel
                    </Button>
                  </DialogActions>
                </Dialog>
     
            <IconButton color="inherit"
                style={{width:22,height:22,paddingBottom:22}} >
                  <CallIcon style={{width:22,height:22}} onClick={initiateCall} />
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
                    <div className="channel__header">
                    <div className="channel__headerLeft">
                      <h4 className="channel__channelName">
                          <strong style={{textTransform:'none',marginTop:15,marginBottom:15}}>Channel Details</strong>
                      </h4>
                    </div>
                        <div className="channela__headerRight" style={{marginRight:5}}>
                          <CloseIcon onClick={handleDrawerClose}/>
                        </div>
                    </div>
                        <div className="channel__detailsBody">
                            <div className="channel__detailsActions">
                              <span style={{paddingLeft:40,paddingRight:50}}>
                                <CallIcon onClick={initiateCall} />
                                Call
                              </span>
                              <span>
                                <DeleteIcon  onClick={() => deleteChannel(id)}/>
                                Delete
                              </span>
                            </div>
                            <hr />
                            <div className="channel__detailsMembers">
                              <h4>Members ({members.length})</h4>
                              {members.map((member) => (
                                <div
                                  key={member?.uid}
                                  className={`available__member ${
                                    member?.status === 'online' ? 'isOnline' : ''
                                  }`}
                                >
                                  <Avatar src={member?.avatar} alt={member?.name} />
                                  <Link to={`/users/${member?.uid}`}>{member?.name}</Link>
                                  <FiberManualRecordIcon />
                                  {member?.scope !== 'admin' ? (
                                    channel?.scope === 'admin' ? (
                                      <PersonAddDisabledIcon
                                        style={{width:17,height:17}}
                                        onClick={() => remMember(id, member?.uid)}
                                        title="{member?.scope}"
                                      />
                                    ) : (
                                      ''
                                    )
                                  ) : (
                                    <LockIcon style={{width:17,height:17}} title={member?.scope} />
                                  )}
                                </div>
                              ))}
                            </div>
                            {channel?.scope === 'owner' ? (
                              <>
                                <hr />
                                <div className="channel__detailsMembers">
                                  <Button className="deleteBtn" onClick={() => deleteChannel(id)}>
                                    Delete Channel
                                  </Button>
                                </div>
                              </>
                            ) : (
                              ''
                            )}
                            <hr/>
                            <div className="channel__header">
                              <div className="channel__headerLeft">
                                <h4 style={{padding:10}} className="channel__channelName">
                                  <strong style={{textTransform:'none'}}>Add Member</strong>
                                </h4>
                              </div>
                           </div>
                           <div className="channel__detailsBody">
                            <form onSubmit={(e) => findUser(e)} className="channel__detailsForm">
                              <input
                                placeholder="Search for a user"
                                onChange={(e) => setKeyword(e.target.value)}
                                required
                              />
                              <Button style={{marginLeft:10}} onClick={(e) => findUser(e)}>
                                {!searching ? 'Find' : <div id="loading"></div>}
                              </Button>
                            </form>
                            <hr />
                              <div className="channel__detailsMembers">
                                <h4>Search Result ({users.length})</h4>
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
                                    {currentUser.uid !== user?.uid ? (
                                      channel?.scope === 'admin' ? (
                                        <PersonAddOutlinedIcon
                                          onClick={() => addMember(id, user?.uid)}
                                        />
                                      ) : (
                                        ''
                                      )
                                    ) : (
                                      ''
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                        </div>
                    </div>
                  </div>
                </Drawer>
              </div>
          </div>
        </div>

        <div id="messages-container" className="channel__messages">
          {messages.map((message) => (
            <Message
              uid={message?.sender.uid}
              name={message.sender?.name}
              avatar={message.sender?.avatar}
              message={message?.text}
              timestamp={message?.sentAt}
              key={message?.sentAt}
            />
          )
          )}

        </div>
          <div className="channel__chatInput">
            <Box component="form">
            <Box width={{xs:350,sm:400,md:1000,lg:1000,xl:1000}}>
                <Editor  onInit={(evt, editor) => editorRef.current = editor}  key={editorKey}
                      apiKey="ayidc0ao36vpduw8cvevrpurygt76f8gmwv4sdcw5keq875y"
                    init={{
                      height: 120,
                      placeholder:`Send Message to Channel`,
                      
                      menubar: false,
                      resize: false,
                      plugins: [
                        'advlist autolink lists link emoticons image imagetools', 
                        'charmap print preview anchor help media ',
                        'searchreplace visualblocks code',
                        'insertdatetime media table paste wordcount'
                      ],
                      toolbar:// eslint-disable-next-line
                        'undo redo | bold italic emoticons| \
                        alignleft aligncenter alignright | \
                        bullist numlist|image gif urldialog| help',
                        
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

                        setup: function (editor) {
                         
                          editor.ui.registry.addToggleButton('gif', {
                            text: 'GIF',
                            onAction: function () {
                             
                             editor.windowManager.open(handleGifClickOpen());
                            
                            }
                          });
                          editor.ui.registry.addButton('urldialog', {
                            text: 'Google Docs',
                            onAction: function () {
                              editor.windowManager.openUrl({
                                title: 'Collaborative Document',
                                url: 'https://docs.google.com/document/d/1wgxz_SuNJ2rl-7dLFv6HIB9EfQwxgeCVuBUESmEBuLc/edit',
                                height: 680,
                                width: 1340
                              });
                            }
                          })
                        }
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
      <div>
    </div>
      {isLive ? <div style={{maxHeight:'92%',maxWidth:1200}} id="callScreen"></div> : ''}
    </div>
  )
}

export default Channel
