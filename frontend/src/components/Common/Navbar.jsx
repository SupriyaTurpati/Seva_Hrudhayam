import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, Bell, Home as HomeIcon, Award, ShieldAlert } from 'lucide-react';
import logo from '../../assets/logo.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <img 
          src={logo} 
          alt="Seva Hrudhayam Namaste Logo" 
          style={{ height: '40px', width: '40px', objectFit: 'contain', borderRadius: '50%', border: '1px solid var(--border-color)', background: '#fff' }} 
        />
        <span>Seva Hrudhayam</span>
      </Link>

      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
          Home
        </NavLink>
        
        <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          About
        </NavLink>

        {user && user.role === 'donor' && (
          <>
            <NavLink to="/donor-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/history" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              My Donations
            </NavLink>
            <NavLink to="/profile" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <User size={16} /> {user.name.split(' ')[0]}
            </NavLink>
          </>
        )}

        {user && user.role === 'orphanage_head' && (
          <>
            <NavLink to="/orphanage-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/notifications" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Bell size={16} /> Alerts
            </NavLink>
            <NavLink to="/profile" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <User size={16} /> {user.headName.split(' ')[0]}
            </NavLink>
          </>
        )}

        {user && user.role === 'admin' && (
          <>
            <NavLink to="/admin-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Admin Panel
            </NavLink>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--danger)', fontWeight: 'bold' }}>
              <ShieldAlert size={16} /> Admin
            </span>
          </>
        )}

        {user ? (
          <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <LogOut size={16} /> Logout
          </button>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/donor-auth" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
              Donor Portal
            </Link>
            <Link to="/orphanage-auth" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
              Orphanage Portal
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
