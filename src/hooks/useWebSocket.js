import { useState, useEffect, useCallback } from 'react';
import webSocketService from '../services/websocketService';

export const useWebSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    let mounted = true;

    const initializeConnection = async () => {
      try {
        await webSocketService.connect();
        if (mounted) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error('WebSocket connection failed:', error);
        if (mounted) {
          setIsConnected(false);
        }
      }
    };

    initializeConnection();

    const checkConnection = () => {
      if (mounted) {
        setIsConnected(webSocketService.getConnectionStatus());
      }
    };

    const intervalId = setInterval(checkConnection, 5000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const subscribeToEvent = useCallback((eventType, callback) => {
    webSocketService.addEventListener(eventType, callback);
    
    return () => {
      webSocketService.removeEventListener(eventType, callback);
    };
  }, []);

  const subscribeToAttendanceEvents = useCallback((callback) => {
    return subscribeToEvent('attendance', callback);
  }, [subscribeToEvent]);

  const subscribeToTaskEvents = useCallback((callback) => {
    return subscribeToEvent('task', callback);
  }, [subscribeToEvent]);

  const subscribeToPunchEvents = useCallback((callback) => {
    return subscribeToEvent('punch', callback);
  }, [subscribeToEvent]);

  return {
    isConnected,
    lastEvent,
    subscribeToAttendanceEvents,
    subscribeToTaskEvents,
    subscribeToPunchEvents,
  };
};
