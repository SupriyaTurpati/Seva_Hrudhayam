import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { playAlertSound } from '../utils/audio';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [newAlertTrigger, setNewAlertTrigger] = useState(null);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to server
    const newSocket = io(window.API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    // Join role-specific socket room
    newSocket.emit('join_room', {
      role: user.role, // 'donor', 'orphanage_head', 'admin'
      userId: user._id
    });

    // Listen for real-time notifications
    newSocket.on('new_alert', (data) => {
      console.log('Real-time alert received:', data);
      playAlertSound();
      setNewAlertTrigger(data);
    });

    newSocket.on('donation_accepted', (data) => {
      console.log('Donation accepted by orphanage:', data);
      setNewAlertTrigger({ type: 'accepted', ...data });
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const value = {
    socket,
    newAlertTrigger,
    clearAlertTrigger: () => setNewAlertTrigger(null)
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
