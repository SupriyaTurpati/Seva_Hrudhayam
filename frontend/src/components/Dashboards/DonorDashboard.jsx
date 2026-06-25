import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import InstantDonationForm from '../Forms/InstantDonationForm';
import FutureBookingForm from '../Forms/FutureBookingForm';
import LeafletMap from '../Common/LeafletMap';
import { Heart, Landmark, MapPin, Phone, CheckCircle2, AlertCircle, RefreshCw, Calendar, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const DonorDashboard = () => {
  const { user } = useAuth();
  const { newAlertTrigger } = useSocket();
  const [activeTab, setActiveTab] = useState('instant'); // 'instant' or 'future'
  const [activeDonations, setActiveDonations] = useState([]);
  const [matchingOrphanages, setMatchingOrphanages] = useState([]);
  const [recentRequest, setRecentRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Setup current location for Map preview
  const [currentLoc, setCurrentLoc] = useState({
    latitude: 17.3850,
    longitude: 78.4867,
    village: 'Hyderabad'
  });

  useEffect(() => {
    // Get current browser location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCurrentLoc({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          village: 'Current Location'
        });
      });
    }
    fetchDonorHistory();
  }, []);

  // Poll or refresh history when a socket trigger happens
  useEffect(() => {
    if (newAlertTrigger && newAlertTrigger.type === 'accepted') {
      setMessage(`Alert: Orphanage "${newAlertTrigger.orphanageName}" has accepted your donation request!`);
      fetchDonorHistory();
    }
  }, [newAlertTrigger]);

  const fetchDonorHistory = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('seva_user');
      const token = storedUser ? JSON.parse(storedUser).token : '';

      const response = await fetch('http://localhost:5000/api/donations/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        // We only care about pending & accepted requests in dashboard active list
        const activeInstants = (data.instant || []).filter(d => d.status === 'pending' || d.status === 'accepted');
        const activeFutures = (data.future || []).filter(d => d.status === 'pending' || d.status === 'accepted');
        setActiveDonations([...activeInstants, ...activeFutures]);
      }
    } catch (err) {
      console.error('Error fetching donor history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInstantSubmit = (request, matches) => {
    setRecentRequest(request);
    setMatchingOrphanages(matches || []);
    
    // Update map coordinates to where request was submitted
    setCurrentLoc({
      latitude: request.latitude,
      longitude: request.longitude,
      village: request.village || 'Donation Point'
    });

    fetchDonorHistory();
  };

  const handleComplete = async (donationId, type) => {
    try {
      const storedUser = localStorage.getItem('seva_user');
      const token = storedUser ? JSON.parse(storedUser).token : '';

      const response = await fetch(`http://localhost:5000/api/donations/${donationId}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });

      if (response.ok) {
        // Fire confetti!
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        
        setMessage('Donation delivered successfully! Thank you for sharing with Seva Hrudhayam.');
        fetchDonorHistory();
        setMatchingOrphanages([]);
        setRecentRequest(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="main-content">
      {/* Session Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(211, 84, 0, 0.05)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <Sparkles size={20} color="var(--primary)" />
        <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
          Welcome, <strong>{user?.name}</strong>. Your session is active temporarily to facilitate instant routing and coordination.
        </p>
      </div>

      {message && (
        <div style={{ padding: '1rem', background: '#eafaf1', color: 'var(--secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid #d4efdf', marginBottom: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {message}
        </div>
      )}

      <div className="grid-2">
        {/* Left Side: Forms */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Tab Selection */}
          <div style={{ display: 'flex', gap: '0.5rem', background: '#ebdcd0', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
            <button
              onClick={() => setActiveTab('instant')}
              className="btn"
              style={{ flex: 1, padding: '0.6rem', background: activeTab === 'instant' ? '#fff' : 'transparent', color: activeTab === 'instant' ? 'var(--primary)' : 'var(--dark)', borderRadius: '4px' }}
            >
              Instant Donation
            </button>
            <button
              onClick={() => setActiveTab('future')}
              className="btn"
              style={{ flex: 1, padding: '0.6rem', background: activeTab === 'future' ? '#fff' : 'transparent', color: activeTab === 'future' ? 'var(--primary)' : 'var(--dark)', borderRadius: '4px' }}
            >
              Schedule Event
            </button>
          </div>

          {activeTab === 'instant' ? (
            <InstantDonationForm onSubmitSuccess={handleInstantSubmit} />
          ) : (
            <FutureBookingForm onSubmitSuccess={() => { fetchDonorHistory(); }} />
          )}

          {/* Active donations list */}
          <div className="glass-panel" style={{ marginTop: '1rem' }}>
            <div className="card-header">
              <h4>Active Submissions ({activeDonations.length})</h4>
              <button onClick={fetchDonorHistory} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} disabled={loading}>
                <RefreshCw size={12} className={loading ? 'spin' : ''} /> Refresh
              </button>
            </div>
            
            {activeDonations.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>
                No active donation sessions. Use the form above to post resources.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {activeDonations.map((donation) => (
                  <div key={donation._id} className="donation-item-row" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'stretch' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className="badge badge-pending" style={{ background: donation.status === 'accepted' ? '#ebf5fb' : '#fef9e7', color: donation.status === 'accepted' ? '#2980b9' : '#f1c40f' }}>
                          {donation.status}
                        </span>
                        <strong style={{ textTransform: 'capitalize' }}>{donation.itemType} ({donation.quantity})</strong>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {donation.bookingDate ? 'Future Event' : 'Instant Alert'}
                      </span>
                    </div>

                    {donation.status === 'accepted' && donation.acceptedBy && (
                      <div style={{ background: 'rgba(39,174,96,0.04)', border: '1px solid #d4efdf', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginTop: '0.25rem' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--secondary)' }}>
                          Accepted by: {donation.acceptedBy.orphanageName}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Phone size={12} /> Contact: {donation.acceptedBy.phone}
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button
                            onClick={() => handleComplete(donation._id, donation.bookingDate ? 'future' : 'instant')}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', width: '100%' }}
                          >
                            Mark Delivery Completed
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Map & Match Tracker */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-panel" style={{ height: 'fit-content' }}>
            <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <MapPin size={18} color="var(--primary)" /> Distribution Map
            </h4>
            
            {/* Draw route if donation accepted */}
            {activeDonations.some(d => d.status === 'accepted' && d.acceptedBy) ? (
              (() => {
                const acceptedDonation = activeDonations.find(d => d.status === 'accepted' && d.acceptedBy);
                const orphanage = acceptedDonation.acceptedBy;
                return (
                  <LeafletMap
                    donorLoc={{ latitude: acceptedDonation.latitude, longitude: acceptedDonation.longitude, village: acceptedDonation.village }}
                    activeOrphanage={{
                      latitude: orphanage.latitude || 17.4,
                      longitude: orphanage.longitude || 78.5,
                      orphanageName: orphanage.orphanageName,
                      phone: orphanage.phone
                    }}
                  />
                );
              })()
            ) : (
              <LeafletMap
                donorLoc={currentLoc}
                orphanages={matchingOrphanages.map(m => ({
                  id: m.id,
                  name: m.name,
                  phone: m.phone,
                  latitude: currentLoc.latitude + (Math.random() - 0.5) * 0.05, // Mock close offset if we want visual variety
                  longitude: currentLoc.longitude + (Math.random() - 0.5) * 0.05,
                  distance: m.distance
                }))}
              />
            )}

            <div style={{ marginTop: '1rem' }}>
              <h5>Nearest Verified Matches</h5>
              {matchingOrphanages.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Submit an instant request to match with nearest orphanages within 20 km.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                  {matchingOrphanages.map((match) => (
                    <div key={match.id} style={{ display: 'flex', justifyContet: 'space-between', padding: '0.5rem', background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', justifyContent: 'space-between' }}>
                      <strong>{match.name}</strong>
                      <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{match.distance.toFixed(1)} km</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorDashboard;
