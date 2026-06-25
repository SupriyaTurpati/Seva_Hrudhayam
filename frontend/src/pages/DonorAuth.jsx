import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, User, Phone, Lock, MapPin, Users, KeyRound, Mail, Eye, EyeOff } from 'lucide-react';

const DonorAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    pincode: '',
    village: '',
    district: '',
    servingCount: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await login({
          phone: formData.phone,
          password: formData.password,
          name: formData.name,
          pincode: formData.pincode,
          village: formData.village,
          district: formData.district,
          servingCount: formData.servingCount
        }, 'donor');
        
        navigate('/donor-dashboard');
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        await register({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password
        }, 'donor');

        navigate('/donor-dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: isLogin ? '550px' : '450px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Heart size={44} color="var(--primary)" fill="var(--primary)" style={{ margin: '0 auto 0.5rem' }} />
          <h2 style={{ fontSize: '1.75rem' }}>Donor Portal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isLogin ? 'Sign in to access your donation dashboard' : 'Create an account to start sharing surplus'}
          </p>
        </div>

        {/* Tab Headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <button
            onClick={() => { setIsLogin(true); setErrorMsg(''); }}
            style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: isLogin ? '3px solid var(--primary)' : 'none', fontWeight: isLogin ? 'bold' : 'normal', color: isLogin ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer' }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setErrorMsg(''); }}
            style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: !isLogin ? '3px solid var(--primary)' : 'none', fontWeight: !isLogin ? 'bold' : 'normal', color: !isLogin ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer' }}
          >
            Sign Up
          </button>
        </div>

        {errorMsg && (
          <p style={{ color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 'bold', background: 'rgba(192, 57, 43, 0.05)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', textAlign: 'center' }}>
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          {/* COMMON: Phone Number */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Phone size={14} /> Phone Number
            </label>
            <input
              type="text"
              name="phone"
              className="form-input"
              placeholder="Enter contact number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* SIGN IN: Needs Name check, Password, Location parameters, and Serving Count */}
          {isLogin ? (
            <>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <User size={14} /> Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Verify registered name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Lock size={14} /> Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-input"
                    style={{ paddingRight: '2.5rem' }}
                    placeholder="Enter account password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: '-0.25rem' }}>
                <Link to="/forgot-password?role=donor" style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                  Forgot password?
                </Link>
              </div>

              <h4 style={{ color: 'var(--primary)', borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.25rem', marginTop: '0.5rem', fontSize: '0.95rem' }}>
                Quick Location Setup
              </h4>
              
              <div className="grid-3" style={{ gap: '0.5rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">District</label>
                  <input type="text" name="district" className="form-input" placeholder="e.g. Medchal" value={formData.district} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Village</label>
                  <input type="text" name="village" className="form-input" placeholder="e.g. Suchitra" value={formData.village} onChange={handleChange} required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Pincode</label>
                  <input type="text" name="pincode" className="form-input" placeholder="500067" value={formData.pincode} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Users size={14} /> Serving capacity (Est. people)
                </label>
                <input
                  type="number"
                  name="servingCount"
                  className="form-input"
                  placeholder="How many people can your events feed?"
                  value={formData.servingCount}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          ) : (
            /* SIGN UP: Name, Email, Password, Confirm Password */
            <>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <User size={14} /> Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Mail size={14} /> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Lock size={14} /> Create Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className="form-input"
                    style={{ paddingRight: '2.5rem' }}
                    placeholder="Create strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <KeyRound size={14} /> Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className="form-input"
                    style={{ paddingRight: '2.5rem' }}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Processing...' : isLogin ? 'Sign In & Access Portal' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonorAuth;
