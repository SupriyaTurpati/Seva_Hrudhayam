import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import './index.css'
// Configure API base URL dynamically
window.API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Global fetch interceptor to redirect local backend calls to production backend URL when needed
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  if (typeof input === 'string' && input.startsWith('http://localhost:5000')) {
    input = input.replace('http://localhost:5000', window.API_URL);
  }
  return originalFetch(input, init);
};

import App from './App.jsx'


createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
