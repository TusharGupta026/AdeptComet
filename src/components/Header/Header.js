import './Header.css'
import { Avatar,Button } from '@material-ui/core'
import { Link, useParams, useHistory } from 'react-router-dom'
import SearchIcon from '@material-ui/icons/Search'
import CloseIcon from '@material-ui/icons/Close';
import Box from '@material-ui/core/Box';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord'
import PersonAddOutlinedIcon from '@material-ui/icons/PersonAddOutlined'
import { useState, useEffect ,React} from 'react'
import { CometChat} from '@cometchat-pro/chat'
import { cometChat } from '../../app.config'
import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Modal from '@material-ui/core/Modal';


function getModalStyle() {
  const top = 50 ;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    borderRadius:15,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

function Header() {
  const { id } = useParams()
  const history = useHistory()
  const [toggle, setToggle] = useState(false)
  const [users, setUsers] = useState([])
  const [searching, setSearching] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [keyword, setKeyword] = useState(null)

  const moveToAcc = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    history.push(`/users/${user.uid}`)
  }

  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = useState(getModalStyle());
  const [open, setOpen] = useState(false);


  const handleClose = () => {
    setOpen(false);
  };

  const findUser = (e) => {
    e.preventDefault()

    searchTerm(keyword)
    setOpen(true);
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

  useEffect(() => {

    setCurrentUser(JSON.parse(localStorage.getItem('user')))
  }, [id])


  return (
    <div className="header">
      <div className="header__left">
        <Box style={{ backgroundColor:'white',color:'black',borderRadius:6}} display={{ xs: 'block',sm:'block', md: 'none', lg: 'none',xl:'none' }}> 
        </Box>
      </div>
      <div>
        <form className="header__middle" onSubmit={(e) => findUser(e)}>
            <input
            
              placeholder="Seach Friends.."
              onChange={(e) => setKeyword(e.target.value)}
              required
            />
            <Button style={{padding:4,backgroundColor:'#e6e6e6',minWidth:30}} onClick={(e) => findUser(e)}>
              {!searching ? <SearchIcon /> : <div id="loading"></div>}
            </Button>
        </form>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
      <div style={modalStyle} className={classes.paper}>
        <Button  onClick={handleClose} style={{display:'flex',float:'right'}}>
           <CloseIcon />
        </Button>
      
        <h2 id="simple-modal-title" style={{paddingBottom:10}}>Search Result ({users.length})</h2>
        <Divider/>
        <div style={{marginTop:20}} id="simple-modal-description">
          {users.map((user) => (
            <div
              key={user?.uid}
              className={`available__member ${
                user?.status === 'online' ? 'isOnline' : ''
              }`}
            >
              <Avatar style={{width:50,height:50}} src={user?.avatar} alt={user?.name} />
              <Link to={`/users/${user?.uid}`}>{user?.name}</Link>
              <FiberManualRecordIcon />
              <Button style={{textTransform:'none',marginLeft:10}} onClick={() => addFriend(user?.uid)}>
               <PersonAddOutlinedIcon style={{paddingRight:10}}/>
                Add Friend
              </Button>
            </div>
  
          ))}

        </div>
    </div>
    </Modal>
      </div>
      <div className="header__right">
        
        <Avatar
          className="header__avatar"
          src={currentUser?.photoURL}
          alt={currentUser?.displayName}
          onClick={moveToAcc}
          style={{float:'right'}}
        />
      </div>
    </div>
  )
}

export default Header
