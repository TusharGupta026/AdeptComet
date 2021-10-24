import React from 'react';
import './Login.css'
import { Button } from '@material-ui/core'
import { NavLink } from 'react-router-dom';
import { auth, provider } from '../../firebase'
import { CometChat } from '@cometchat-pro/chat'
import { cometChat } from '../../app.config'
import IntroImg from '../../imgs/whatisslackx.jpeg';
import SlackLogoWhite from "../../imgs/slack_logo_white.png";
import { useState } from 'react'

function Login() {
  const [loading, setLoading] = useState(false)

  const signIn = () => {
    setLoading(true)
    auth
      .signInWithPopup(provider)
      .then((res) => loginCometChat(res.user))
      .catch((error) => {
        setLoading(false)
        alert(error.message)
      })
  }

  const loginCometChat = (data) => {
    const authKey = cometChat.AUTH_KEY

    CometChat.login(data.uid, authKey)
      .then((u) => {
        localStorage.setItem('user', JSON.stringify(data))
        window.location.href = '/'
        console.log(u)
        setLoading(false)
      })
      .catch((error) => {
        if (error.code === 'ERR_UID_NOT_FOUND') {
          signUpWithCometChat(data)
        } else {
          console.log(error)
          setLoading(false)
          alert(error.message)
        }
      })
  }

  const signUpWithCometChat = (data) => {
    const authKey = cometChat.AUTH_KEY
    const user = new CometChat.User(data.uid)

    user.setName(data.displayName)
    user.setAvatar(data.photoURL)

    CometChat.createUser(user, authKey)
      .then(() => {
        setLoading(false)
        alert('You are now signed up, click the button again to login')
      })
      .catch((error) => {
        console.log(error)
        setLoading(false)
        alert(error.message)
      })
  }

  return (
    <div className="body__splash">
        <div  className="MainBKG">
            <nav id="navbar">
              <div className="navbar__left">
                <NavLink to="/login" activeClassName="active">
                  <img
                    className="navbar__logo"
                    src={SlackLogoWhite}
                    alt="SlackX Logo" />
                </NavLink>
              </div>
              <div className="navbar__right">
              <Button style={{ cursor: 'pointer' ,color:'black'}} onClick={signIn}>
                {!loading ? <div style={{backgroundColor:'white',padding:10,textTransform:'none',borderRadius:20,fontSize:17}} color>Sign in With <span style={{color:'#4285F4'}}>G</span><span style={{color:'#EA4335'}}>o</span><span style={{color:'#FBBC05'}}>o</span><span style={{color:'#4285F4'}}>g</span><span style={{color:'#34A853'}}>l</span><span style={{color:'#EA4335'}}>e</span></div> : <div id="loading"></div>}
              </Button>
              </div>
            </nav>
            <div className="opening_title">Adept makes it <span className="orange">downright pleasant</span><br /> to work together</div>
              <img  className="splash_page_top_img" src={IntroImg} alt=""/>
            <div>
         </div>
         </div>
    </div>

  )
}

export default Login
