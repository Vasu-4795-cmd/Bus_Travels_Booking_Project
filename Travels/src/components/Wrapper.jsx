
import React from 'react'
import { Link } from 'react-router-dom'

const Wrapper = ({userId, handleLogout, children}) => {

    const logout = ()=>{
        handleLogout()
    }

  return (
    <div>
      {userId ? (
   
            <button onClick={logout}>Logout</button>
    
      ) :
      <Link to="/login">
            <button>Login</button>
        </Link>
      }
   <main>{children}</main>
    </div>
  )
}

export default Wrapper
