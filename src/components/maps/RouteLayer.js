import React, { useEffect, useRef } from "react";
import { detectStops } from "../../utils/routeUtils";

// Calculate bearing between two points
function calculateBearing(lat1, lon1, lat2, lon2) {
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
          Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
  const bearing = Math.atan2(y, x) * 180 / Math.PI;
  return (bearing + 360) % 360;
}

export default function RouteLayer({ map, maps, points }) {
  const polylineRef = useRef(null);
  const stopMarkersRef = useRef(new Map());
  const arrowMarkersRef = useRef(new Map());

  useEffect(() => {
    if (!map || !maps || !points || points.length < 2) return;

    // Clear existing route
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
    }
    stopMarkersRef.current.forEach(marker => marker.setMap(null));
    stopMarkersRef.current.clear();
    arrowMarkersRef.current.forEach(marker => marker.setMap(null));
    arrowMarkersRef.current.clear();

    // Draw route polyline with direction arrows
    const path = points.map(p => ({ lat: p.lat, lng: p.lng }));
    polylineRef.current = new maps.Polyline({
      path,
      map,
      strokeColor: "#2563eb",
      strokeWeight: 3,
      strokeOpacity: 0.7,
      icons: [{
        icon: {
          path: maps.SymbolPath.FORWARD_OPEN_ARROW,
          scale: 2,
          strokeColor: "#2563eb",
          fillColor: "#2563eb",
        },
        offset: "50%",
        repeat: "100px",
      }],
    });

    // Add directional arrows at key points
    const arrowInterval = Math.max(1, Math.floor(points.length / 10)); // Show ~10 arrows
    for (let i = arrowInterval; i < points.length; i += arrowInterval) {
      const prev = points[i - 1];
      const curr = points[i];
      
      const bearing = calculateBearing(prev.lat, prev.lng, curr.lat, curr.lng);
      
      // Create arrow marker
      const arrowSymbol = {
        path: maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 3,
        strokeColor: "#1e40af",
        fillColor: "#1e40af",
        rotation: bearing,
      };

      const arrowMarker = new maps.Marker({
        position: { lat: curr.lat, lng: curr.lng },
        map,
        icon: arrowSymbol,
        zIndex: 10,
      });

      arrowMarkersRef.current.set(i, arrowMarker);
    }

    // Detect and mark stops
    const stops = detectStops(points);
    stops.forEach((stop, index) => {
      const marker = new maps.Marker({
        position: { lat: stop.lat, lng: stop.lng },
        map,
        title: `Stop ${index + 1}: ${stop.duration} min`,
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#dc2626",
          fillOpacity: 0.8,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
        zIndex: 20,
      });

      const infoWindow = new maps.InfoWindow();
      marker.addListener("click", () => {
        infoWindow.setContent(`
          <div class="p-2 max-w-xs">
            <div class="font-semibold text-sm">🛑 Stop ${index + 1}</div>
            <div class="text-xs text-gray-600 mt-1">
              <div>📍 ${stop.address}</div>
              <div>⏱️ ${stop.duration} minutes</div>
              <div>🕐 ${new Date(stop.startTime).toLocaleString()} - ${new Date(stop.endTime).toLocaleString()}</div>
            </div>
          </div>
        `);
        infoWindow.open(map, marker);
      });

      stopMarkersRef.current.set(index, marker);
    });

  }, [map, maps, points]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (polylineRef.current) polylineRef.current.setMap(null);
      stopMarkersRef.current.forEach(m => {
        if (m.setMap) m.setMap(null);
        else m.map = null;
      });
      stopMarkersRef.current.clear();
      arrowMarkersRef.current.forEach(m => {
        if (m.setMap) m.setMap(null);
        else m.map = null;
      });
      arrowMarkersRef.current.clear();
    };
  }, []);

  return null;
}
