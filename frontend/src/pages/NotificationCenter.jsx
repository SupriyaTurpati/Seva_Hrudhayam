import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, ShieldAlert, CheckCircle, RefreshCw, MailOpen } from 'lucide-react';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('seva_user');
      const token = storedUser ? JSON.parse(storedUser).token : '';

      const response = await fetch('http://localhost:5000/api/donations/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setNotifications(data || []);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to sync notification feeds.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const storedUser = localStorage.getItem('seva_user');
      const token = storedUser ? JSON.parse(storedUser).token : '';

      const response = await fetch(`http://localhost:5000/api/donations/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        // Toggle read state locally
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '750px' }}>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Notification Center</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Track and manage all system updates and location matches.</p>
        </div>
        <button onClick={fetchNotifications} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Alerts
        </button>
      </div>

      {errorMsg && <p style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{errorMsg}</p>}
      
      {loading && <p style={{ textAlign: 'center', padding: '2rem' }}>Syncing alerts...</p>}

      {!loading && notifications.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <Bell size={48} color="var(--border-color)" style={{ margin: '0 auto 1rem' }} />
          <h3>All caught up!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You don't have any notifications at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {notifications.map((n) => (
            <div
              key={n._id}
              className="glass-panel"
              style={{
                borderLeft: n.type === 'alert' ? '5px solid var(--primary)' : '5px solid var(--secondary)',
                background: n.read ? '#fff' : 'rgba(211,84,0,0.02)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  background: n.type === 'alert' ? 'rgba(211,84,0,0.1)' : 'rgba(39,174,96,0.1)',
                  color: n.type === 'alert' ? 'var(--primary)' : 'var(--secondary)',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {n.type === 'alert' ? <ShieldAlert size={20} /> : <CheckCircle size={20} />}
                </div>

                <div>
                  <p style={{ fontWeight: n.read ? 'normal' : 'bold', color: 'var(--dark)', fontSize: '0.95rem' }}>{n.message}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  onClick={() => handleMarkAsRead(n._id)}
                  className="btn btn-outline"
                  title="Mark as Read"
                  style={{ padding: '0.4rem', border: 'none', background: 'rgba(0,0,0,0.02)' }}
                >
                  <MailOpen size={16} color="var(--primary)" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
