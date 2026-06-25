import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from 'lucide-react';
import logo from '../assets/logo.png';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const role = searchParams.get('role');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');

    if (!token || !role) {
      setErrorMsg('Invalid password reset link. Missing token or role parameter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, role, password })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Password update failed.');
      }

      setMessage(data.message);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getLoginRedirectPath = () => {
    if (role === 'admin') return '/admin-login';
    if (role === 'orphanage_head') return '/orphanage-auth';
    return '/donor-auth';
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img 
            src={logo} 
            alt="Seva Hrudhayam logo" 
            style={{ height: '60px', width: '60px', objectFit: 'contain', borderRadius: '50%', marginBottom: '1rem', border: '1px solid var(--border-color)', background: '#fff' }} 
          />
          <h2 style={{ fontSize: '1.6rem' }}>Create New Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Set a secure password for role: <strong style={{ textTransform: 'capitalize' }}>{role?.replace('_', ' ')}</strong>
          </p>
        </div>

        {errorMsg && (
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 'bold', background: 'rgba(192, 57, 43, 0.05)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', textAlign: 'center' }}>
            {errorMsg}
          </p>
        )}

        {message ? (
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <div style={{ padding: '0.75rem', background: '#eafaf1', color: 'var(--secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid #d4efdf', fontSize: '0.9rem', fontWeight: 'bold' }}>
              {message}
            </div>
            <Link to={getLoginRedirectPath()} className="btn btn-primary" style={{ width: '100%', gap: '0.25rem' }}>
              Go to Portal Login <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* New Password */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Lock size={14} /> New Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="Enter at least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Lock size={14} /> Confirm Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-input"
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Updating Password...' : 'Save Password & Update'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
