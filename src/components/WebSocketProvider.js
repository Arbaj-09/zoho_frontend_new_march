'use client';

import { useEffect } from 'react';
import webSocketService from '../services/websocketService';

export default function WebSocketProvider({ children }) {
  useEffect(() => {
    // Initialize WebSocket connection when app starts
    webSocketService.connect()
      .then(() => {
        console.log('WebSocket initialized in admin panel');
      })
      .catch((error) => {
        console.error('WebSocket initialization failed:', error);
      });

    // Cleanup on unmount
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  return <>{children}</>;
}
