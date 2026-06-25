import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(formData, 'admin');
      navigate('/admin-dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Admin login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '2rem', borderTop: '4px solid var(--danger)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <ShieldAlert size={44} color="var(--danger)" style={{ margin: '0 auto 0.5rem' }} />
          <h2 style={{ fontSize: '1.5rem' }}>Admin Control Center</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Enter credential details to access administrative operations.
          </p>
        </div>

        {errorMsg && (
          <p style={{ color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 'bold', background: 'rgba(192, 57, 43, 0.05)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', textAlign: 'center' }}>
            {errorMsg}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Mail size={14} /> Admin Email
            </label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="admin@sevahrudhayam.org"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Lock size={14} /> Secure Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                style={{ paddingRight: '2.5rem' }}
                placeholder="••••••••"
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

          <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--danger)', fontWeight: 'bold' }}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn btn-danger" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? 'Authenticating Admin...' : 'Sign In as Administrator'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
