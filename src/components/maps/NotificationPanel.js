import React, { useState, useEffect, useRef } from "react";

export default function NotificationPanel({ baseUrl, alerts }) {
  // If alerts are passed as props, use them (from main WebSocket)
  // Otherwise, create separate connection (for standalone use)
  
  if (alerts) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <h3 className="font-semibold text-sm mb-2">Notifications</h3>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-xs text-gray-400">No alerts</div>
          ) : (
            alerts.map((a, idx) => (
              <div key={idx} className="text-xs p-2 bg-yellow-50 border border-yellow-200 rounded cursor-pointer hover:bg-yellow-100"
                   onClick={() => {
                     // Focus map on alert location
                     window.dispatchEvent(new CustomEvent("FOCUS_LOCATION", { 
                       detail: { lat: a.latitude, lng: a.longitude, employeeName: a.employeeName } 
                     }));
                   }}>
                <div className="font-medium">{a.employeeName} is idle</div>
                <div className="text-gray-600">{new Date(a.timestamp).toLocaleString()}</div>
                {a.address && <div className="text-gray-500 truncate">{a.address}</div>}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Fallback: separate WebSocket connection
  const [localAlerts, setLocalAlerts] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!baseUrl || window.StompJs) return;
    
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.0/bundles/stomp.umd.min.js";
    script.async = true;
    script.onload = () => {
      const { Client } = window.StompJs;
      wsRef.current = new Client({
        brokerURL: `${baseUrl}/ws`,
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });
      wsRef.current.onConnect = () => {
        wsRef.current.subscribe("/topic/alerts", (msg) => {
          const data = JSON.parse(msg.body);
          setLocalAlerts(prev => [data, ...prev.slice(0, 9)]);
        });
      };
      wsRef.current.activate();
    };
    document.head.appendChild(script);
    return () => { 
      if (wsRef.current) wsRef.current.deactivate();
      if (document.head.contains(script)) document.head.removeChild(script); 
    };
  }, [baseUrl]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3">
      <h3 className="font-semibold text-sm mb-2">Notifications</h3>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {localAlerts.length === 0 ? (
          <div className="text-xs text-gray-400">No alerts</div>
        ) : (
          localAlerts.map((a, idx) => (
            <div key={idx} className="text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
              <div className="font-medium">{a.employeeName} is idle</div>
              <div className="text-gray-600">{new Date(a.timestamp).toLocaleString()}</div>
              {a.address && <div className="text-gray-500 truncate">{a.address}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
