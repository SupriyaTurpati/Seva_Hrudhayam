import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #ebdcd0', borderTop: '4px solid #d35400', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: '#d35400', fontWeight: 'bold' }}>Loading Seva Hrudhayam...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    // If not logged in, redirect to home
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If role not allowed, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
