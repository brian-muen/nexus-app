import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useDispatch } from 'react-redux'
import { openLogInModal, openSignUpModal } from '../redux/slices/modalSlice'

const Header: React.FC = () => {
  const { user, logout } = useAuth()

  const initials = user ? user.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase() : 'U'

  const dispatch = useDispatch()

  return (
    <header className="nx-header">
      <div className="nx-header-left">
        <h1 className="nx-logo">Nexus</h1>
        <p className="nx-tagline">All your course deadlines in one place</p>
      </div>
      <div className="nx-header-right">
        <button className="nx-btn">Sync</button>
        {user ? (
          <>
            <button className="nx-btn" onClick={logout}>Logout</button>
            <div className="nx-avatar">{initials}</div>
          </>
        ) : (
          <>
            <div className="flex gap-2 items-center">
              <button className="nx-btn" onClick={() => dispatch(openLogInModal())}>Log In</button>
              <button className="nx-btn-outline" onClick={() => dispatch(openSignUpModal())}>Sign Up</button>
            </div>
            <div className="nx-avatar">G</div>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
