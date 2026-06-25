import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, ShieldCheck, MapPin, Landmark, Phone, Users, Check } from 'lucide-react';

const ProfileSettings = () => {
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);

  // Determine role fields
  const isDonor = user?.role === 'donor';

  // Local state initialized with user info
  const [formData, setFormData] = useState({
    name: isDonor ? (user?.name || '') : (user?.headName || ''),
    phone: user?.phone || '',
    village: isDonor ? (user?.village || '') : (user?.orphanage?.village || ''),
    district: isDonor ? (user?.district || '') : (user?.orphanage?.district || ''),
    pincode: isDonor ? (user?.pincode || '') : (user?.orphanage?.pincode || ''),
    servingCount: isDonor ? (user?.servingCount || '') : '',
    // Orphanage Head details
    orphanageName: !isDonor ? (user?.orphanage?.orphanageName || '') : '',
    boysCount: !isDonor ? (user?.orphanage?.boysCount || 0) : 0,
    girlsCount: !isDonor ? (user?.orphanage?.girlsCount || 0) : 0
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="main-content" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>Profile Settings</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your account settings, capacity parameters, and geographical scope.</p>
      </div>

      {success && (
        <div style={{ padding: '1rem', background: '#eafaf1', color: 'var(--secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid #d4efdf', marginBottom: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={18} /> Profile parameters updated locally!
        </div>
      )}

      <div className="profile-grid">
        {/* Left Side Details card */}
        <div className="glass-panel" style={{ height: 'fit-content', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(211,84,0,0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={40} />
          </div>
          <div>
            <h4>{formData.name}</h4>
            <span className="badge" style={{ background: isDonor ? '#ebdcd0' : '#ebf5fb', color: isDonor ? 'var(--primary)' : '#2980b9', marginTop: '0.25rem' }}>
              {isDonor ? 'Donor Profile' : 'Orphanage Head'}
            </span>
          </div>

          <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', textAlign: 'left', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={12} /> {formData.phone}</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={12} /> {formData.village}, {formData.district}</p>
            {!isDonor && (
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Landmark size={12} /> {formData.orphanageName}</p>
            )}
          </div>
        </div>

        {/* Right Side Settings Form */}
        <form className="glass-panel" onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--primary)' }}>
            Account Parameters
          </h3>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input type="text" name="phone" className="form-input" value={formData.phone} onChange={handleChange} disabled />
            </div>
          </div>

          {!isDonor && (
            <>
              <div className="form-group">
                <label className="form-label">Orphanage Name</label>
                <input type="text" name="orphanageName" className="form-input" value={formData.orphanageName} onChange={handleChange} required />
              </div>
              
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Boys Headcount</label>
                  <input type="number" name="boysCount" className="form-input" value={formData.boysCount} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Girls Headcount</label>
                  <input type="number" name="girlsCount" className="form-input" value={formData.girlsCount} onChange={handleChange} required />
                </div>
              </div>
            </>
          )}

          {isDonor && (
            <div className="form-group">
              <label className="form-label">Average Event Serving Size (Headcount)</label>
              <input type="number" name="servingCount" className="form-input" value={formData.servingCount} onChange={handleChange} required />
            </div>
          )}

          <h4 style={{ borderBottom: '1px dashed var(--border-color)', paddingBottom: '0.25rem', marginTop: '0.5rem', fontSize: '0.95rem' }}>
            Location Parameters
          </h4>

          <div className="grid-3" style={{ gap: '0.5rem' }}>
            <div className="form-group">
              <label className="form-label">District</label>
              <input type="text" name="district" className="form-input" value={formData.district} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Village / Locality</label>
              <input type="text" name="village" className="form-input" value={formData.village} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label">Pincode</label>
              <input type="text" name="pincode" className="form-input" value={formData.pincode} onChange={handleChange} required />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', marginTop: '1rem' }}>
            Save Profile Details
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
