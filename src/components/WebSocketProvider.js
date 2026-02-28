'use client';

import { useEffect } from 'react';
import webSocketService from '../services/websocketService';

export default function WebSocketProvider({ children }) {
  useEffect(() => {
    // Initialize WebSocket connection when app starts
    let connectionTimeout;
    
    const initializeWebSocket = async () => {
      try {
        connectionTimeout = setTimeout(() => {
          console.warn('WebSocket connection timeout - continuing without real-time features');
        }, 5000); // 5 second timeout
        
        await webSocketService.connect()
          .then(() => {
            clearTimeout(connectionTimeout);
            console.log('WebSocket initialized successfully in admin panel');
          })
          .catch((error) => {
            clearTimeout(connectionTimeout);
            console.warn('WebSocket initialization failed, app continuing without real-time features:', error.message);
          });
      } catch (error) {
        clearTimeout(connectionTimeout);
        console.error('WebSocket initialization error:', error);
      }
    };

    // Only initialize WebSocket if not on login page (to avoid connection errors during login)
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      initializeWebSocket();
    }

    // Cleanup on unmount
    return () => {
      if (connectionTimeout) {
        clearTimeout(connectionTimeout);
      }
      webSocketService.disconnect();
    };
  }, []);

  return <>{children}</>;
}
