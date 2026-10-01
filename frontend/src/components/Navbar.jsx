import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/my-bookings', label: 'My Bookings' },
    { to: '/profile', label: 'Profile' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">A</span>
          Asteria Stay
        </Link>

        <button className="mobile-toggle" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">
          ☰
        </button>

        <div className={`nav-panel ${open ? 'open' : ''}`}>
          <div className="nav-links">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active nav-link' : 'nav-link')} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}

            {isAdmin && (
              <>
                <NavLink to="/admin" className={({ isActive }) => (isActive ? 'active nav-link' : 'nav-link')} onClick={() => setOpen(false)}>Dashboard</NavLink>
                <NavLink to="/admin/hotels" className={({ isActive }) => (isActive ? 'active nav-link' : 'nav-link')} onClick={() => setOpen(false)}>Hotels</NavLink>
                <NavLink to="/admin/rooms" className={({ isActive }) => (isActive ? 'active nav-link' : 'nav-link')} onClick={() => setOpen(false)}>Rooms</NavLink>
                <NavLink to="/admin/bookings" className={({ isActive }) => (isActive ? 'active nav-link' : 'nav-link')} onClick={() => setOpen(false)}>Bookings</NavLink>
              </>
            )}
          </div>

          <div className="nav-auth">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn btn-light" onClick={() => setOpen(false)}>Login</Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setOpen(false)}>Register</Link>
              </>
            ) : (
              <>
                <span className="user-pill">{user?.name || 'User'}</span>
                <button className="btn btn-light" onClick={handleLogout}>Logout</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
