import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Bell, ShieldAlert, Menu, X } from 'lucide-react';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link 
        to="/" 
        className="nav-logo" 
        style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}
        onClick={() => setMenuOpen(false)}
      >
        <img 
          src={logo} 
          alt="Seva Hrudhayam Namaste Logo" 
          style={{ height: '40px', width: '40px', objectFit: 'contain', borderRadius: '50%', border: '1px solid var(--border-color)', background: '#fff' }} 
        />
        <span>Seva Hrudhayam</span>
      </Link>

      {/* Hamburger Toggle Button for Mobile */}
      <button 
        className="menu-toggle" 
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation menu"
      >
        {menuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <NavLink 
          to="/" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} 
          end
          onClick={() => setMenuOpen(false)}
        >
          Home
        </NavLink>
        
        <NavLink 
          to="/about" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={() => setMenuOpen(false)}
        >
          About
        </NavLink>

        {user && user.role === 'donor' && (
          <>
            <NavLink 
              to="/donor-dashboard" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/history" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              My Donations
            </NavLink>
            <NavLink 
              to="/profile" 
              className="nav-link" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              onClick={() => setMenuOpen(false)}
            >
              <User size={16} /> {user.name.split(' ')[0]}
            </NavLink>
          </>
        )}

        {user && user.role === 'orphanage_head' && (
          <>
            <NavLink 
              to="/orphanage-dashboard" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/notifications" 
              className="nav-link" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              onClick={() => setMenuOpen(false)}
            >
              <Bell size={16} /> Alerts
            </NavLink>
            <NavLink 
              to="/profile" 
              className="nav-link" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
              onClick={() => setMenuOpen(false)}
            >
              <User size={16} /> {user.headName.split(' ')[0]}
            </NavLink>
          </>
        )}

        {user && user.role === 'admin' && (
          <>
            <NavLink 
              to="/admin-dashboard" 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              Admin Panel
            </NavLink>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger)', fontWeight: 'bold' }}>
              <ShieldAlert size={16} /> Admin
            </span>
          </>
        )}

        {user ? (
          <button 
            onClick={handleLogout} 
            className="btn btn-outline" 
            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%', justifyContent: 'center' }}
          >
            <LogOut size={16} /> Logout
          </button>
        ) : (
          <div className="nav-auth-buttons" style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
            <Link 
              to="/donor-auth" 
              className="btn btn-primary" 
              style={{ padding: '0.5rem 1rem', flex: 1, textSelf: 'center', textAlign: 'center' }}
              onClick={() => setMenuOpen(false)}
            >
              Donor Portal
            </Link>
            <Link 
              to="/orphanage-auth" 
              className="btn btn-secondary" 
              style={{ padding: '0.5rem 1rem', flex: 1, textSelf: 'center', textAlign: 'center' }}
              onClick={() => setMenuOpen(false)}
            >
              Orphanage Portal
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
