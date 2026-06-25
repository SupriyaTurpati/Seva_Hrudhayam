import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, Compass, RefreshCw, Award, CheckCircle2 } from 'lucide-react';

const DonationHistoryPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('seva_user');
      const token = storedUser ? JSON.parse(storedUser).token : '';

      if (user.role === 'donor') {
        const response = await fetch('http://localhost:5000/api/donations/history', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          // Combine instant & future requests
          const allInstants = (data.instant || []).map(r => ({ ...r, type: 'Instant Alert' }));
          const allFutures = (data.future || []).map(f => ({ ...f, type: 'Future Booking' }));
          setHistory([...allInstants, ...allFutures].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
      } else if (user.role === 'orphanage_head') {
        const response = await fetch('http://localhost:5000/api/orphanage/alerts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setHistory((data.history || []).map(h => ({
            ...h.donationId,
            createdAt: h.completedAt,
            status: 'completed',
            type: h.donationModel === 'FutureBooking' ? 'Future Booking' : 'Instant Alert',
            acceptedBy: { orphanageName: user.orphanage?.orphanageName }
          })));
        }
      }
    } catch (err) {
      console.error(err);
      setError('Could not download history logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '900px' }}>
      <div className="card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2>Donation Archive</h2>
          <p style={{ color: 'var(--text-secondary)' }}>View logs of all your successful and processed donations.</p>
        </div>
        <button onClick={fetchHistory} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Sync Archive
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center', padding: '2rem' }}>Loading archive...</p>}
      {error && <p style={{ color: 'var(--danger)', fontWeight: 'bold' }}>{error}</p>}

      {!loading && history.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem' }}>
          <Compass size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h3>No Records Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't completed any donation processes yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {history.map((record) => (
            <div key={record._id} className="glass-panel" style={{ borderLeft: record.status === 'completed' ? '5px solid var(--secondary)' : '5px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className={`badge badge-${record.status}`}>{record.status}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>{record.type}</span>
                </div>
                
                <h4 style={{ textTransform: 'capitalize' }}>{record.itemType} ({record.quantity})</h4>
                
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Submitted: {new Date(record.createdAt).toLocaleDateString()} | Area: {record.village}, {record.district}
                </p>
                {record.itemDescription && <p style={{ fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.25rem' }}>"{record.itemDescription}"</p>}
              </div>

              <div style={{ textAlign: 'right' }}>
                {record.status === 'completed' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--secondary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={16} /> Delivered
                  </div>
                )}
                {record.acceptedBy && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Fulfiller: <strong>{record.acceptedBy.orphanageName}</strong>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonationHistoryPage;
