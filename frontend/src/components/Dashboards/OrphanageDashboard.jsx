import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import LeafletMap from '../Common/LeafletMap';
import { playAlertSound } from '../../utils/audio';
import { Bell, MapPin, Users, Phone, ShieldAlert, CheckCircle, RefreshCw, Check, X, ShieldCheck } from 'lucide-react';

const OrphanageDashboard = () => {
  const { user, checkUserProfile } = useAuth();
  const { newAlertTrigger, clearAlertTrigger } = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Listen to WebSocket triggers to reload dashboard data
  useEffect(() => {
    if (newAlertTrigger) {
      console.log('Orphanage dashboard socket update trigger:', newAlertTrigger);
      fetchAlerts();
      
      // Flash a header message
      if (newAlertTrigger.message) {
        setSuccessMsg(newAlertTrigger.message);
      }
      clearAlertTrigger();
    }
  }, [newAlertTrigger]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      // Automatically check and sync current verification status
      await checkUserProfile();

      const storedUser = localStorage.getItem('seva_user');
      const token = storedUser ? JSON.parse(storedUser).token : '';

      const response = await fetch('http://localhost:5000/api/donations/alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (response.ok) {
        setAlerts(data.nearby || []);
        setActiveDeliveries(data.active || []);
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to sync alerts feed.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id, type) => {
    try {
      const storedUser = localStorage.getItem('seva_user');
      const token = storedUser ? JSON.parse(storedUser).token : '';

      const response = await fetch(`http://localhost:5000/api/donations/${id}/accept`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Accept failed');
      }

      setSuccessMsg('Donation request accepted! Coordinate with donor.');
      fetchAlerts();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleReject = async (id, type) => {
    try {
      const storedUser = localStorage.getItem('seva_user');
      const token = storedUser ? JSON.parse(storedUser).token : '';

      const response = await fetch(`http://localhost:5000/api/donations/${id}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        setSuccessMsg('Request hidden.');
        fetchAlerts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (id, type) => {
    try {
      const storedUser = localStorage.getItem('seva_user');
      const token = storedUser ? JSON.parse(storedUser).token : '';

      const response = await fetch(`http://localhost:5000/api/donations/${id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        setSuccessMsg('Delivery completed successfully! Added to archive.');
        fetchAlerts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Safe checks for coordinates
  const orphanageLoc = user && user.orphanage
    ? { latitude: user.orphanage.latitude, longitude: user.orphanage.longitude }
    : { latitude: 17.3850, longitude: 78.4867 };

  return (
    <div className="main-content">
      {/* Verification Guard Alert */}
      {!user?.isVerified && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: '#fdf3f2', border: '1px solid #f5c6cb', borderRadius: 'var(--radius-md)', color: 'var(--danger)', marginBottom: '1.5rem' }}>
          <ShieldAlert size={24} />
          <div>
            <h5 style={{ color: 'var(--danger)', fontWeight: 'bold' }}>Awaiting Verification</h5>
            <p style={{ fontSize: '0.85rem' }}>
              Your account is pending verification by the administrator. You can monitor nearby donation coordinates, but the accept feature will remain restricted.
            </p>
          </div>
        </div>
      )}

      {/* Verified Status Banner */}
      {user?.isVerified && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#ebf5fb', borderRadius: 'var(--radius-sm)', border: '1px solid #a9cce3', marginBottom: '1rem', color: '#2980b9', fontSize: '0.85rem', fontWeight: 'bold' }}>
          <ShieldCheck size={16} /> Verified Orphanage Head Portal
        </div>
      )}

      {successMsg && (
        <div style={{ padding: '0.75rem 1rem', background: '#eafaf1', color: 'var(--secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid #d4efdf', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontWeight: '600' }}>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '0.75rem 1rem', background: '#fdf3f2', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', border: '1px solid #f5c6cb', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg('')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: 'bold' }}>X</button>
        </div>
      )}

      {/* Profile Overview */}
      <section className="glass-panel" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center' }}>
        <div>
          <h3 style={{ color: 'var(--primary)' }}>{user?.orphanage?.orphanageName || 'Orphanage Panel'}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Head: {user?.headName} | Contact: {user?.phone} | Area: {user?.orphanage?.village}, {user?.orphanage?.district}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ background: 'rgba(211,84,0,0.06)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Boys</span>
            <h4 style={{ fontSize: '1.25rem' }}>{user?.orphanage?.boysCount || 0}</h4>
          </div>
          <div style={{ background: 'rgba(39,174,96,0.06)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>Girls</span>
            <h4 style={{ fontSize: '1.25rem' }}>{user?.orphanage?.girlsCount || 0}</h4>
          </div>
        </div>
      </section>

      <div className="grid-2">
        {/* Left: Alerts Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-panel alert-card">
            <div className="alert-pulse"></div>
            <div className="card-header">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} color="var(--primary)" /> Real-Time Donation Alerts ({alerts.length})
              </h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={playAlertSound} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                  Test sound
                </button>
                <button onClick={fetchAlerts} className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}>
                  <RefreshCw size={10} /> Sync
                </button>
              </div>
            </div>

            {alerts.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', fontSize: '0.9rem' }}>
                No active donation alerts nearby. Dashboard plays sound automatically when new alerts arrive.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {alerts.map((alert) => (
                  <div key={alert._id} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', background: '#fff', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge badge-pending" style={{ background: 'rgba(211,84,0,0.08)', color: 'var(--primary)' }}>
                        {alert.itemType}
                      </span>
                      <strong style={{ color: 'var(--secondary)' }}>{alert.distance.toFixed(1)} km away</strong>
                    </div>

                    <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      <p><strong>Quantity:</strong> {alert.quantity}</p>
                      <p><strong>Estimated Servings:</strong> Can feed ~{alert.servingCount} kids</p>
                      {alert.itemDescription && <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>"{alert.itemDescription}"</p>}
                      {alert.type === 'future' && (
                        <p style={{ background: '#fdfbf7', border: '1px solid #ebdcd0', padding: '0.25rem 0.5rem', borderRadius: '4px', display: 'inline-block', fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem', fontWeight: 'bold' }}>
                          Scheduled Date: {new Date(alert.bookingDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {/* PRIVACY GUARD: Hide contact until accepted */}
                    <div style={{ fontSize: '0.8rem', padding: '0.5rem', background: '#f9f9f9', borderRadius: '4px', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
                      Donor Name: <strong>{alert.donorId?.name}</strong> | Phone: <em>[Hidden until accepted]</em>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleAccept(alert._id, alert.type)}
                        className="btn btn-secondary"
                        style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', gap: '0.25rem' }}
                        disabled={!user?.isVerified}
                      >
                        <Check size={14} /> Accept Request
                      </button>
                      <button
                        onClick={() => handleReject(alert._id, alert.type)}
                        className="btn btn-outline"
                        style={{ padding: '0.4rem', fontSize: '0.8rem', gap: '0.25rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                      >
                        <X size={14} /> Hide
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Map and Active deliveries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Map display */}
          <div className="glass-panel">
            <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <MapPin size={18} color="var(--primary)" /> Nearby Alert Maps
            </h4>
            <LeafletMap
              donorLoc={orphanageLoc}
              orphanages={alerts.map(a => ({
                id: a._id,
                name: `${a.itemType} (${a.quantity})`,
                phone: `Distance: ${a.distance.toFixed(1)} km`,
                latitude: a.latitude,
                longitude: a.longitude,
                distance: a.distance
              }))}
            />
          </div>

          {/* Active Pickups */}
          <div className="glass-panel">
            <h4>Active Connections ({activeDeliveries.length})</h4>
            
            {activeDeliveries.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem 0', fontSize: '0.85rem' }}>
                No active pickups. Accepted donations appear here with full contact coordinates.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
                {activeDeliveries.map((delivery) => (
                  <div key={delivery._id} style={{ border: '1px solid #a9dfbf', borderRadius: 'var(--radius-sm)', padding: '0.75rem', background: '#f9fefb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #a9dfbf', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>
                      <strong>{delivery.itemType} ({delivery.quantity})</strong>
                      <span style={{ color: 'var(--secondary)', fontWeight: 'bold' }}>{delivery.distance.toFixed(1)} km</span>
                    </div>

                    <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                      <p>Donor Name: <strong>{delivery.donorId?.name}</strong></p>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                        <Phone size={14} /> Call Donor: {delivery.donorId?.phone}
                      </p>
                      <p>Location: {delivery.village || 'Coordinates provided'}</p>
                    </div>

                    <button
                      onClick={() => handleComplete(delivery._id, delivery.type)}
                      className="btn btn-secondary"
                      style={{ width: '100%', padding: '0.4rem', fontSize: '0.8rem' }}
                    >
                      Mark Pickup Completed
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrphanageDashboard;
