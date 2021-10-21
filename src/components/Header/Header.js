import './Header.css'
import { Avatar } from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import Box from '@material-ui/core/Box';
import { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'

function Header() {
  const history = useHistory()
  const [user, setUser] = useState(null)

  const moveToAcc = () => {
    const user = JSON.parse(localStorage.getItem('user'))
    history.push(`/users/${user.uid}`)
  }

  useEffect(() => {
    const data = localStorage.getItem('user')
    setUser(JSON.parse(data))
  }, [])

  return (
    <div className="header">
      <div className="header__left">
        <Box style={{ backgroundColor:'white',color:'black',borderRadius:6}} display={{ xs: 'block',sm:'block', md: 'none', lg: 'none',xl:'none' }}> 
        </Box>
      </div>
      <div className="header__middle">
        <SearchIcon />
        <input className='inputHeader' type="search" placeholder="Search..." />
      </div>
      <div className="header__right">
        
        <Avatar
          className="header__avatar"
          src={user?.photoURL}
          alt={user?.displayName}
          onClick={moveToAcc}
        />
      </div>
    </div>
  )
}

export default Header
