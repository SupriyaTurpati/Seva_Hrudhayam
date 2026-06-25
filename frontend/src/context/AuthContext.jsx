import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for session
    const storedUser = localStorage.getItem('seva_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        localStorage.removeItem('seva_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials, role) => {
    let endpoint = '/api/auth/login-donor';
    if (role === 'orphanage') endpoint = '/api/auth/login-orphanage';
    if (role === 'admin') endpoint = '/api/auth/login-admin';

    const response = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Save user & token details
    const userData = { ...data, role: role === 'orphanage' ? 'orphanage_head' : data.role };
    setUser(userData);
    localStorage.setItem('seva_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (details, role) => {
    const endpoint = role === 'donor' ? '/api/auth/register-donor' : '/api/auth/register-orphanage';
    
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    if (role === 'donor') {
      setUser(data);
      localStorage.setItem('seva_user', JSON.stringify(data));
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('seva_user');
  };

  const checkUserProfile = async () => {
    const storedUser = localStorage.getItem('seva_user');
    if (!storedUser) return;
    try {
      const parsedUser = JSON.parse(storedUser);
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${parsedUser.token}` }
      });
      const data = await response.json();
      if (response.ok) {
        const userData = { ...parsedUser, ...data };
        setUser(userData);
        localStorage.setItem('seva_user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Failed to sync profile status:', err);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkUserProfile,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
