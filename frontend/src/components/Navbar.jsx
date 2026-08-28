import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Navbar.css'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => pathname === path ? 'nav-link active' : 'nav-link'

  return (
    <nav className="navbar glass">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <span className="brand-heart">♥</span>
          <span className="brand-text">Matrimony</span>
        </Link>

        {isAuthenticated ? (
        <>
            <div className="nav-links">
              <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
              <Link to="/matches" className={isActive('/matches')}>Matches</Link>
              <Link to="/preferences" className={isActive('/preferences')}>Preferences</Link>
              <Link to="/profile/me" className={isActive('/profile/me')}>My Profile</Link>
            </div>
            <div className="nav-actions">
              <span className="nav-user">
                <span className="user-dot" />
                {user?.name || user?.custom_id || user?.email?.split('@')[0]}
              </span>
              <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </>
        ) : (
          <div className="nav-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
