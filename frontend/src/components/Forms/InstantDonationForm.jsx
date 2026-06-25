import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';

const InstantDonationForm = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    itemType: 'Food',
    itemDescription: '',
    quantity: '',
    servingCount: '',
    pincode: '',
    village: '',
    district: '',
    latitude: '',
    longitude: ''
  });

  const [locating, setLocating] = useState(false);
  const [locStatus, setLocStatus] = useState('pending'); // 'pending', 'success', 'error'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [matches, setMatches] = useState([]);

  // Auto-request location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('error');
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setLocStatus('pending');

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
        setLocStatus('error');
        setLocating(false);
        setErrorMsg('Could not detect location. Please fill in manual details.');
        // Default coordinates fallback (e.g. Hyderabad)
        setFormData((prev) => ({
          ...prev,
          latitude: 17.3850,
          longitude: 78.4867
        }));
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!formData.quantity || !formData.servingCount) {
      setErrorMsg('Please specify quantity and estimate serving size.');
      return;
    }

    if (!formData.latitude || !formData.longitude) {
      setErrorMsg('Location coordinates are required. Please trigger location detection.');
      return;
    }

    setLoading(true);

    try {
      const storedUser = localStorage.getItem('seva_user');
      const token = storedUser ? JSON.parse(storedUser).token : '';

      const response = await fetch('http://localhost:5000/api/donations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Donation submission failed');
      }

      setMatches(data.matches || []);
      if (onSubmitSuccess) {
        onSubmitSuccess(data.request, data.matches);
      }

      // Reset Form
      setFormData({
        itemType: 'Food',
        itemDescription: '',
        quantity: '',
        servingCount: '',
        pincode: '',
        village: '',
        district: '',
        latitude: formData.latitude,
        longitude: formData.longitude
      });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="glass-panel" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
        Instant Resource Donation
      </h3>

      {errorMsg && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 'bold' }}>{errorMsg}</p>}

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Item Category</label>
          <select name="itemType" className="form-input" value={formData.itemType} onChange={handleChange}>
            <option value="Food">Food (Social Extra)</option>
            <option value="Clothes">Usable Clothes</option>
            <option value="Toys">Toys for Kids</option>
            <option value="Old Beds">Beds / Cot Essentials</option>
            <option value="Other">Other Items</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Approx Quantity / Sizing</label>
          <input
            type="text"
            name="quantity"
            className="form-input"
            placeholder="e.g. 50 plates, 3 packets, 2 boxes"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Serving Capacity (Headcount)</label>
          <input
            type="number"
            name="servingCount"
            className="form-input"
            placeholder="No. of people it can support"
            value={formData.servingCount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">District / Area</label>
          <input
            type="text"
            name="district"
            className="form-input"
            placeholder="e.g. Hyderabad"
            value={formData.district}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Village / Locality Name</label>
          <input
            type="text"
            name="village"
            className="form-input"
            placeholder="e.g. Madhapur"
            value={formData.village}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Pincode</label>
          <input
            type="text"
            name="pincode"
            className="form-input"
            placeholder="e.g. 500081"
            value={formData.pincode}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Additional Description / Description</label>
        <textarea
          name="itemDescription"
          className="form-input"
          rows="2"
          placeholder="e.g. Freshly cooked wedding rice and curry. Kept in clean containers."
          value={formData.itemDescription}
          onChange={handleChange}
        />
      </div>

      {/* Geolocation Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fcfcfc', border: '1px dashed var(--border-color)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={20} color={locStatus === 'success' ? 'var(--secondary)' : 'var(--primary)'} />
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
              {locStatus === 'success' ? 'Browser Geolocation Locked' : locating ? 'Tracking coordinates...' : 'Coordinates Awaiting Lock'}
            </p>
            {formData.latitude && (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Lat: {Number(formData.latitude).toFixed(4)}, Lng: {Number(formData.longitude).toFixed(4)}
              </p>
            )}
          </div>
        </div>
        
        <button type="button" onClick={detectLocation} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.25rem' }} disabled={locating}>
          {locating ? <Loader2 size={12} className="spin" /> : <Navigation size={12} />}
          Refresh Coordinates
        </button>
      </div>

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Alerting Orphanages...' : 'Submit & Notify Nearby Orphanages'}
      </button>
    </form>
  );
};

export default InstantDonationForm;
