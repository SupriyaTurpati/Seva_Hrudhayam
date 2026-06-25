import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Phone, Lock, Home as HomeIcon, Mail, MapPin, Navigation, Loader2, Eye, EyeOff } from 'lucide-react';

const OrphanageAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // For registration: 1 = Head Credentials, 2 = Orphanage Profile

  const [formData, setFormData] = useState({
    headName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Step 2 details
    orphanageName: '',
    email: '',
    aadharNumber: '',
    boysCount: '',
    girlsCount: '',
    district: '',
    village: '',
    pincode: '',
    latitude: '',
    longitude: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locStatus, setLocStatus] = useState('pending');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        setLocStatus('success');
        setLocating(false);
      },
      (error) => {
        console.error(error);
        setErrorMsg('Location detection failed. Locked Hyderabad coordinates as default.');
        setFormData((prev) => ({
          ...prev,
          latitude: 17.3850,
          longitude: 78.4867
        }));
        setLocStatus('error');
        setLocating(false);
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isLogin) {
      try {
        await login({ phone: formData.phone, password: formData.password }, 'orphanage');
        navigate('/orphanage-dashboard');
      } catch (err) {
        setErrorMsg(err.message || 'Login failed');
      }
    } else {
      if (step === 1) {
        if (formData.password !== formData.confirmPassword) {
          setErrorMsg('Passwords do not match');
          return;
        }
        if (formData.password.length < 6) {
          setErrorMsg('Password must be at least 6 characters');
          return;
        }
        detectLocation(); // Auto grab location for next step
        setStep(2);
      } else {
        if (!formData.orphanageName || !formData.email || !formData.district || !formData.village || !formData.pincode || !formData.latitude) {
          setErrorMsg('Please enter all orphanage profile fields and lock your location coordinates.');
          return;
        }

        try {
          await register({
            headName: formData.headName,
            phone: formData.phone,
            password: formData.password,
            orphanageName: formData.orphanageName,
            email: formData.email,
            boysCount: Number(formData.boysCount) || 0,
            girlsCount: Number(formData.girlsCount) || 0,
            aadharNumber: formData.aadharNumber,
            district: formData.district,
            village: formData.village,
            pincode: formData.pincode,
            latitude: Number(formData.latitude),
            longitude: Number(formData.longitude)
          }, 'orphanage');

          setSuccessMsg('Registration request submitted! Awaiting Admin verification before you can accept alerts.');
          setIsLogin(true);
          setStep(1);
        } catch (err) {
          setErrorMsg(err.message || 'Registration failed');
        }
      }
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Shield size={44} color="var(--secondary)" fill="var(--secondary)" style={{ margin: '0 auto 0.5rem' }} />
          <h2 style={{ fontSize: '1.75rem' }}>Orphanage Head Portal</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isLogin ? 'Sign in to access alert sound dashboard' : `Register Head Account (Step ${step} of 2)`}
          </p>
        </div>

        {/* Tab Headers */}
        {step === 1 && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <button
              onClick={() => { setIsLogin(true); setErrorMsg(''); }}
              style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: isLogin ? '3px solid var(--secondary)' : 'none', fontWeight: isLogin ? 'bold' : 'normal', color: isLogin ? 'var(--secondary)' : 'var(--text-secondary)', cursor: 'pointer' }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setErrorMsg(''); }}
              style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: !isLogin ? '3px solid var(--secondary)' : 'none', fontWeight: !isLogin ? 'bold' : 'normal', color: !isLogin ? 'var(--secondary)' : 'var(--text-secondary)', cursor: 'pointer' }}
            >
              Register Head
            </button>
          </div>
        )}

        {errorMsg && (
          <p style={{ color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 'bold', background: 'rgba(192, 57, 43, 0.05)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', textAlign: 'center' }}>
            {errorMsg}
          </p>
        )}
        {successMsg && (
          <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 'bold', background: 'rgba(39, 174, 96, 0.05)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', textAlign: 'center' }}>
            {successMsg}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {isLogin ? (
            /* LOGIN FLOW */
            <>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Phone size={14} /> Head Contact Number
                </label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  placeholder="Enter phone number"
                  value={formData.phone}
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
                    placeholder="Enter password"
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
                <Link to="/forgot-password?role=orphanage_head" style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: 'bold' }}>
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="btn btn-secondary" style={{ width: '100%', marginTop: '0.5rem' }}>
                Sign In & Launch Dashboard
              </button>
            </>
          ) : (
            /* REGISTER FLOW */
            <>
              {step === 1 ? (
                /* Step 1: Head Credentials */
                <>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <User size={14} /> Head Name
                    </label>
                    <input
                      type="text"
                      name="headName"
                      className="form-input"
                      placeholder="Orphanage head full name"
                      value={formData.headName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Phone size={14} /> Contact Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      className="form-input"
                      placeholder="Unique contact number"
                      value={formData.phone}
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
                        placeholder="Password"
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
                      <Lock size={14} /> Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        className="form-input"
                        style={{ paddingRight: '2.5rem' }}
                        placeholder="Confirm password"
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

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                    Next: Orphanage details
                  </button>
                </>
              ) : (
                /* Step 2: Orphanage Details */
                <>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <HomeIcon size={14} /> Orphanage Name
                      </label>
                      <input
                        type="text"
                        name="orphanageName"
                        className="form-input"
                        placeholder="e.g. Hope Orphan Home"
                        value={formData.orphanageName}
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
                        placeholder="e.g. contact@orphanage.org"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Aadhar Number (Verification)</label>
                      <input
                        type="text"
                        name="aadharNumber"
                        className="form-input"
                        placeholder="12-digit Aadhar"
                        value={formData.aadharNumber}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Total Capacity (Boys / Girls)</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="number"
                          name="boysCount"
                          className="form-input"
                          placeholder="Boys"
                          value={formData.boysCount}
                          onChange={handleChange}
                          required
                        />
                        <input
                          type="number"
                          name="girlsCount"
                          className="form-input"
                          placeholder="Girls"
                          value={formData.girlsCount}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid-3" style={{ gap: '0.5rem' }}>
                    <div className="form-group">
                      <label className="form-label">District</label>
                      <input type="text" name="district" className="form-input" placeholder="e.g. Ranga Reddy" value={formData.district} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Village / Locality</label>
                      <input type="text" name="village" className="form-input" placeholder="e.g. Alwal" value={formData.village} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Pincode</label>
                      <input type="text" name="pincode" className="form-input" placeholder="500010" value={formData.pincode} onChange={handleChange} required />
                    </div>
                  </div>

                  {/* Geolocation Lock for Matching */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fdf9', border: '1px dashed var(--secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <MapPin size={20} color="var(--secondary)" />
                      <div>
                        <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                          {locStatus === 'success' ? 'Map Geolocation Locked' : locating ? 'Locking Coordinates...' : 'Coordinates Required'}
                        </p>
                        {formData.latitude && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Lat: {Number(formData.latitude).toFixed(4)}, Lng: {Number(formData.longitude).toFixed(4)}
                          </p>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={detectLocation} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.25rem', borderColor: 'var(--secondary)', color: 'var(--secondary)' }} disabled={locating}>
                      {locating ? <Loader2 size={12} className="spin" /> : <Navigation size={12} />}
                      Detect Location
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>
                      Back
                    </button>
                    <button type="submit" className="btn btn-secondary" style={{ flex: 2 }}>
                      Submit Registration
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default OrphanageAuth;
