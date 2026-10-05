import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import './Navbar.css';

// Professional Vector SVG Icons
const Icons = {
  logoTicket: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
      <path d="M13 5v2"/><path d="M13 11v2"/><path d="M13 17v2"/>
    </svg>
  ),
  movies: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18"/>
      <line x1="7" x2="7" y1="2" y2="22"/><line x1="17" x2="17" y1="2" y2="22"/>
      <line x1="2" x2="22" y1="12" y2="12"/><line x1="2" x2="7" y1="7" y2="7"/>
      <line x1="2" x2="7" y1="17" y2="17"/><line x1="17" x2="22" y1="17" y2="17"/>
      <line x1="17" x2="22" y1="7" y2="7"/>
    </svg>
  ),
  ticket: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/>
      <path d="M9 12h6"/>
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.8 17 5 19 5a1 1 0 0 1 1 1z"/>
      <path d="m9 12 2 2 4-4"/>
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
    </svg>
  )
};

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { showToast } = useToast();

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  const handleLogout = () => {
    logout();
    showToast('Signed out successfully', 'info');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Brand */}
        <NavLink to="/" className="navbar-brand">
          <div className="navbar-logo">
            {Icons.logoTicket}
          </div>
          <span className="navbar-name">AppZeto <span className="navbar-name-brand">Movies</span></span>
        </NavLink>

        {/* Professional Header Tabs */}
        <div className="navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            id="nav-home"
          >
            <span className="nav-link-icon">{Icons.movies}</span>
            <span>Now Showing</span>
          </NavLink>

          {user && (
            <NavLink
              to="/bookings"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              id="nav-bookings"
            >
              <span className="nav-link-icon">{Icons.ticket}</span>
              <span>My Tickets</span>
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              id="nav-admin"
            >
              <span className="nav-link-icon">{Icons.shield}</span>
              <span>Admin Console</span>
            </NavLink>
          )}
        </div>

        {/* Right — User Profile & Sign Out */}
        <div className="navbar-right">
          {user ? (
            <div className="user-profile-wrap">
              <div className="navbar-user">
                <div className="navbar-avatar">{initials}</div>
                <div className="navbar-user-info">
                  <div className="navbar-username">{user.name}</div>
                  <span className={`badge ${isAdmin ? 'badge-warning' : 'badge-info'} navbar-role`}>
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                id="navbar-logout"
                className="btn btn-ghost btn-sm navbar-logout"
                onClick={handleLogout}
                title="Sign Out"
              >
                {Icons.logout}
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <NavLink to="/auth">
              <button id="navbar-signin" className="btn btn-primary btn-sm">Sign In</button>
            </NavLink>
          )}
        </div>

      </div>
    </nav>
  );
}
