import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Users, Landmark, Clock, CheckSquare, Layers, Search, RefreshCw, Check, X, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Dashboard data state
  const [metrics, setMetrics] = useState({
    totalDonors: 0,
    totalOrphanages: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    completedDeliveries: 0
  });
  const [donors, setDonors] = useState([]);
  const [orphanages, setOrphanages] = useState([]);
  const [requests, setRequests] = useState([]);
  
  // App UI states
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('orphanages'); // 'orphanages', 'requests', 'donors'
  const [message, setMessage] = useState('');
  
  // Filter states
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterItemType, setFilterItemType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('seva_user');
      const token = storedUser ? JSON.parse(storedUser).token : '';

      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setMetrics(data.counters || {});
        setDonors(data.donors || []);
        setOrphanages(data.orphanages || []);
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to load dashboard logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToggle = async (headId, currentStatus) => {
    setMessage('');
    try {
      const storedUser = localStorage.getItem('seva_user');
      const token = storedUser ? JSON.parse(storedUser).token : '';

      const response = await fetch(`http://localhost:5000/api/admin/orphanages/${headId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isVerified: !currentStatus })
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`Status updated: ${data.message}`);
        fetchDashboardData();
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('Failed to toggle verification state.');
    }
  };

  // Client-side filtering logic
  const filteredRequests = requests.filter((req) => {
    const matchesDistrict = filterDistrict
      ? (req.district && req.district.toLowerCase().includes(filterDistrict.toLowerCase()))
      : true;
      
    const matchesItem = filterItemType === 'all'
      ? true
      : req.itemType === filterItemType;
      
    const matchesStatus = filterStatus === 'all'
      ? true
      : req.status === filterStatus;

    const matchesDate = filterDate
      ? (req.bookingDate && new Date(req.bookingDate).toDateString() === new Date(filterDate).toDateString())
      : true;

    return matchesDistrict && matchesItem && matchesStatus && matchesDate;
  });

  return (
    <div className="main-content">
      {/* Overview Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>System Audit & Administration</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome, Administrator. Monitor donations and verify institutional credentials.</p>
        </div>
        <button onClick={fetchDashboardData} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Sync Data
        </button>
      </div>

      {message && (
        <div style={{ padding: '1rem', background: '#ebf5fb', color: '#2980b9', borderRadius: 'var(--radius-sm)', border: '1px solid #a9cce3', marginBottom: '1.5rem', fontWeight: 'bold' }}>
          {message}
        </div>
      )}

      {/* Metrics Cards Grid */}
      <section className="metrics-container">
        <div className="metric-card glass-panel" style={{ flex: 1 }}>
          <div className="metric-icon" style={{ background: 'rgba(211,84,0,0.06)' }}>
            <Users size={20} />
          </div>
          <div className="metric-details">
            <h3>{metrics.totalDonors}</h3>
            <p>Total Donors</p>
          </div>
        </div>

        <div className="metric-card glass-panel" style={{ flex: 1 }}>
          <div className="metric-icon" style={{ background: 'rgba(39,174,96,0.06)', color: 'var(--secondary)' }}>
            <Landmark size={20} />
          </div>
          <div className="metric-details">
            <h3>{metrics.totalOrphanages}</h3>
            <p>Orphanages</p>
          </div>
        </div>

        <div className="metric-card glass-panel" style={{ flex: 1 }}>
          <div className="metric-icon" style={{ background: 'rgba(241,196,15,0.06)', color: 'var(--accent)' }}>
            <Clock size={20} />
          </div>
          <div className="metric-details">
            <h3>{metrics.pendingRequests}</h3>
            <p>Pending Alerts</p>
          </div>
        </div>

        <div className="metric-card glass-panel" style={{ flex: 1 }}>
          <div className="metric-icon" style={{ background: 'rgba(41,128,185,0.06)', color: '#2980b9' }}>
            <Layers size={20} />
          </div>
          <div className="metric-details">
            <h3>{metrics.acceptedRequests}</h3>
            <p>Active Claims</p>
          </div>
        </div>

        <div className="metric-card glass-panel" style={{ flex: 1 }}>
          <div className="metric-icon" style={{ background: 'rgba(39,174,96,0.06)', color: 'var(--secondary)' }}>
            <CheckSquare size={20} />
          </div>
          <div className="metric-details">
            <h3>{metrics.completedDeliveries}</h3>
            <p>Completed deliveries</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid var(--border-color)', marginBottom: '1.5rem', gap: '1rem' }}>
        <button
          onClick={() => setActiveTab('orphanages')}
          style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'orphanages' ? '3px solid var(--primary)' : 'none', fontWeight: activeTab === 'orphanages' ? 'bold' : 'normal', color: activeTab === 'orphanages' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}
        >
          Verify Orphanages
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'requests' ? '3px solid var(--primary)' : 'none', fontWeight: activeTab === 'requests' ? 'bold' : 'normal', color: activeTab === 'requests' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}
        >
          Monitor Donations
        </button>
        <button
          onClick={() => setActiveTab('donors')}
          style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'donors' ? '3px solid var(--primary)' : 'none', fontWeight: activeTab === 'donors' ? 'bold' : 'normal', color: activeTab === 'donors' ? 'var(--primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem' }}
        >
          Registered Donors
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'orphanages' && (
        <div className="glass-panel">
          <h4 style={{ marginBottom: '1rem' }}>Orphanage Heads Registration Audit</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f5efe6', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem' }}>Orphanage Name</th>
                  <th style={{ padding: '0.75rem' }}>Head Name</th>
                  <th style={{ padding: '0.75rem' }}>Contact</th>
                  <th style={{ padding: '0.75rem' }}>Capacity (B / G)</th>
                  <th style={{ padding: '0.75rem' }}>District</th>
                  <th style={{ padding: '0.75rem' }}>Verification State</th>
                  <th style={{ padding: '0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {orphanages.map((orphanage) => {
                  const isVerified = orphanage.headId?.isVerified;
                  return (
                    <tr key={orphanage._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{orphanage.orphanageName}</td>
                      <td style={{ padding: '0.75rem' }}>{orphanage.headName}</td>
                      <td style={{ padding: '0.75rem' }}>
                        {orphanage.phone} <br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{orphanage.email}</span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>{orphanage.boysCount} Boys / {orphanage.girlsCount} Girls</td>
                      <td style={{ padding: '0.75rem' }}>{orphanage.village}, {orphanage.district}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className="badge" style={{ background: isVerified ? '#ebf5fb' : '#fdf3f2', color: isVerified ? 'var(--secondary)' : 'var(--danger)', border: isVerified ? '1px solid #d4efdf' : '1px solid #f5c6cb' }}>
                          {isVerified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <button
                          onClick={() => handleVerifyToggle(orphanage.headId?._id, isVerified)}
                          className="btn"
                          style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.8rem',
                            background: isVerified ? 'var(--danger)' : 'var(--secondary)',
                            color: '#fff'
                          }}
                        >
                          {isVerified ? 'Revoke Verification' : 'Verify & Approve'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {orphanages.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No registered orphanages found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Filters Panel */}
          <div className="glass-panel" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>District Filter</label>
              <input
                type="text"
                placeholder="District..."
                className="form-input"
                style={{ padding: '0.5rem' }}
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
              />
            </div>
            
            <div style={{ minWidth: '150px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Item Type</label>
              <select className="form-input" style={{ padding: '0.5rem' }} value={filterItemType} onChange={(e) => setFilterItemType(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="Food">Food</option>
                <option value="Clothes">Clothes</option>
                <option value="Toys">Toys</option>
                <option value="Old Beds">Old Beds</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ minWidth: '150px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Status</label>
              <select className="form-input" style={{ padding: '0.5rem' }} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div style={{ minWidth: '150px' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Scheduled Date</label>
              <input
                type="date"
                className="form-input"
                style={{ padding: '0.5rem' }}
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            
            {(filterDistrict || filterItemType !== 'all' || filterStatus !== 'all' || filterDate) && (
              <button
                onClick={() => { setFilterDistrict(''); setFilterItemType('all'); setFilterStatus('all'); setFilterDate(''); }}
                className="btn btn-outline"
                style={{ padding: '0.5rem', marginTop: '1.2rem', fontSize: '0.8rem' }}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Table list */}
          <div className="glass-panel">
            <h4 style={{ marginBottom: '1rem' }}>Donation Requests & Audit Trail ({filteredRequests.length} results)</h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f5efe6', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.75rem' }}>Donor</th>
                    <th style={{ padding: '0.75rem' }}>Resource Type</th>
                    <th style={{ padding: '0.75rem' }}>Quantity / Servings</th>
                    <th style={{ padding: '0.75rem' }}>Location Area</th>
                    <th style={{ padding: '0.75rem' }}>Type</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                    <th style={{ padding: '0.75rem' }}>Assigned Partner</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => (
                    <tr key={req._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <strong>{req.donorId?.name}</strong> <br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{req.donorId?.phone}</span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className="badge" style={{ background: 'rgba(211,84,0,0.06)', color: 'var(--primary)' }}>
                          {req.itemType}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <strong>{req.quantity}</strong> <br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Feed cap: {req.servingCount}</span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {req.village}, {req.district} <br />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pincode: {req.pincode}</span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {req.bookingDate ? (
                          <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.8rem' }}>
                            Future ({new Date(req.bookingDate).toLocaleDateString()})
                          </span>
                        ) : (
                          <span style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>Instant</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={`badge badge-${req.status}`}>
                          {req.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        {req.acceptedBy ? (
                          <div>
                            <strong>{req.acceptedBy.orphanageName}</strong> <br />
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{req.acceptedBy.phone}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No matching donations found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'donors' && (
        <div className="glass-panel">
          <h4 style={{ marginBottom: '1rem' }}>Registered Donors</h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f5efe6', borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem' }}>Donor Name</th>
                  <th style={{ padding: '0.75rem' }}>Contact Phone</th>
                  <th style={{ padding: '0.75rem' }}>Location Scope</th>
                  <th style={{ padding: '0.75rem' }}>Est. Support Capacity</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((donor) => (
                  <tr key={donor._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{donor.name}</td>
                    <td style={{ padding: '0.75rem' }}>{donor.phone}</td>
                    <td style={{ padding: '0.75rem' }}>{donor.village ? `${donor.village}, ${donor.district} (${donor.pincode})` : 'Not configured'}</td>
                    <td style={{ padding: '0.75rem' }}>Feeds approx ~{donor.servingCount || 0} persons</td>
                  </tr>
                ))}
                {donors.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No registered donors found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
