import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Shield, User, HelpCircle, Lock, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('donor');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [devLink, setDevLink] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMessage('');
    setDevLink('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to request reset link.');
      }

      setMessage(data.message);
      if (data.resetLink) {
        setDevLink(data.resetLink);
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
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
          <h2 style={{ fontSize: '1.6rem' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Enter your registered email to receive a recovery link.
          </p>
        </div>

        {errorMsg && (
          <p style={{ color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 'bold', background: 'rgba(192, 57, 43, 0.05)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', textAlign: 'center' }}>
            {errorMsg}
          </p>
        )}

        {message && (
          <div style={{ padding: '0.75rem', background: '#eafaf1', color: 'var(--secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid #d4efdf', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center', fontWeight: '600' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Role selection */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Shield size={14} /> My Portal Role
            </label>
            <select className="form-input" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="donor">Donor</option>
              <option value="orphanage_head">Orphanage Head</option>
              <option value="admin">System Admin</option>
            </select>
          </div>

          {/* Email field */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Mail size={14} /> Email Address
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. user@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Simulating Mail...' : 'Send Recovery Link'}
          </button>
        </form>

        {/* Developer Help Mode Shortcut */}
        {devLink && (
          <div style={{ marginTop: '1.5rem', background: 'rgba(241,196,15,0.06)', border: '1px dashed var(--accent)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--dark)', fontWeight: 'bold', marginBottom: '0.4rem' }}>
              [Developer Demo Shortcut]
            </p>
            <a 
              href={devLink} 
              className="btn btn-outline" 
              style={{ display: 'inline-flex', padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: '100%', justifyContent: 'center' }}
            >
              Go to Password Reset page
            </a>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem' }}>
            <ArrowLeft size={14} /> Back to Login selection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
