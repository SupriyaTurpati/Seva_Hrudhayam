import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Navigation, Loader2 } from 'lucide-react';

const FutureBookingForm = ({ onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    bookingDate: '',
    itemType: 'Food',
    quantity: '',
    servingCount: '',
    pincode: '',
    village: '',
    district: '',
    latitude: '',
    longitude: '',
    extraNotes: ''
  });

  const [locating, setLocating] = useState(false);
  const [locStatus, setLocStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('error');
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
        setLocStatus('error');
        setLocating(false);
        // Fallback default coordinates
        setFormData((prev) => ({
          ...prev,
          latitude: 17.3850,
          longitude: 78.4867
        }));
      }
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.bookingDate || !formData.quantity || !formData.servingCount) {
      setErrorMsg('Please specify booking date, quantity, and serving size.');
      return;
    }

    setLoading(true);

    try {
      const storedUser = localStorage.getItem('seva_user');
      const token = storedUser ? JSON.parse(storedUser).token : '';

      const response = await fetch('http://localhost:5000/api/donations/book-future', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Future booking failed');
      }

      setSuccessMsg('Future booking created successfully! Orphanages have been scheduled.');
      if (onSubmitSuccess) {
        onSubmitSuccess(data.booking);
      }

      // Reset
      setFormData({
        bookingDate: '',
        itemType: 'Food',
        quantity: '',
        servingCount: '',
        pincode: '',
        village: '',
        district: '',
        latitude: formData.latitude,
        longitude: formData.longitude,
        extraNotes: ''
      });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="glass-panel" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
        Schedule Future Donation
      </h3>

      {errorMsg && <p style={{ color: 'var(--danger)', fontSize: '0.9rem', fontWeight: 'bold' }}>{errorMsg}</p>}
      {successMsg && <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 'bold' }}>{successMsg}</p>}

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Event Date</label>
          <input
            type="date"
            name="bookingDate"
            className="form-input"
            value={formData.bookingDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Item Category</label>
          <select name="itemType" className="form-input" value={formData.itemType} onChange={handleChange}>
            <option value="Food">Food (Weddings, Birthdays, etc.)</option>
            <option value="Clothes">Bulk Clothes</option>
            <option value="Toys">Toys & Playkits</option>
            <option value="Old Beds">Bedding Materials</option>
            <option value="Other">Other items</option>
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Estimated Sizing</label>
          <input
            type="text"
            name="quantity"
            className="form-input"
            placeholder="e.g. 150 meals, 5 sacks of clothes"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Min Serving Capacity</label>
          <input
            type="number"
            name="servingCount"
            className="form-input"
            placeholder="People served"
            value={formData.servingCount}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid-3">
        <div className="form-group">
          <label className="form-label">District</label>
          <input type="text" name="district" className="form-input" placeholder="District" value={formData.district} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Village / Town</label>
          <input type="text" name="village" className="form-input" placeholder="Village" value={formData.village} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Pincode</label>
          <input type="text" name="pincode" className="form-input" placeholder="Pincode" value={formData.pincode} onChange={handleChange} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Extra Notes (Timing, Catering info, Delivery instructions)</label>
        <textarea
          name="extraNotes"
          className="form-input"
          rows="2"
          placeholder="e.g. Function completes at 2 PM. Food needs to be collected before 4 PM."
          value={formData.extraNotes}
          onChange={handleChange}
        />
      </div>

      {/* Geolocation Section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fcfcfc', border: '1px dashed var(--border-color)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={20} color={locStatus === 'success' ? 'var(--secondary)' : 'var(--primary)'} />
          <div>
            <p style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
              {locStatus === 'success' ? 'Event Location coordinates locked' : locating ? 'Tracking coordinates...' : 'Coordinates Locked'}
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
          Get Coordinates
        </button>
      </div>

      <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={loading}>
        {loading ? 'Submitting Schedule...' : 'Schedule Event Donation'}
      </button>
    </form>
  );
};

export default FutureBookingForm;
