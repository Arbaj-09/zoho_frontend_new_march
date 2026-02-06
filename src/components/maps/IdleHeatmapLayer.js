import React, { useEffect, useRef } from "react";

export default function IdleHeatmapLayer({ map, maps, dailyEvents }) {
  const heatmapRef = useRef(null);

  useEffect(() => {
    if (!map || !maps || !dailyEvents || dailyEvents.length === 0) return;

    // Clear existing heatmap
    if (heatmapRef.current) {
      heatmapRef.current.setMap(null);
    }

    // Filter only IDLE events from daily events
    const idleEvents = dailyEvents.filter(event => event.type === "IDLE");

    // Convert idle events to heatmap data
    const heatmapData = idleEvents.map(event => ({
      location: new maps.LatLng(event.latitude, event.longitude),
      weight: Math.min(event.durationMinutes / 60, 1), // Weight by duration (max 1 hour = weight 1)
    }));

    // Create heatmap gradient
    const gradient = [
      'rgba(0, 255, 0, 0)',  // Transparent green
      'rgba(0, 255, 0, 1)',  // Solid green (short idle)
      'rgba(255, 255, 0, 1)', // Yellow (medium idle)
      'rgba(255, 0, 0, 1)'   // Red (long idle)
    ];

    // Create heatmap layer
    if (maps.visualization && maps.visualization.HeatmapLayer) {
      heatmapRef.current = new maps.visualization.HeatmapLayer({
        data: heatmapData,
        map: map,
        radius: 50, // 50m radius
        opacity: 0.6,
        gradient: gradient,
        dissipating: false,
      });
    } else {
      // Fallback: create simple circle markers for idle locations
      idleEvents.forEach((point, index) => {
        const color = point.weight > 0.5 ? '#dc2626' : point.weight > 0.25 ? '#f59e0b' : '#22c55e';
        const radius = 20 + point.weight * 30; // 20-50px radius based on duration
        
        const circle = new maps.Circle({
          strokeColor: color,
          strokeOpacity: 0.3,
          strokeWeight: 2,
          fillColor: color,
          fillOpacity: 0.2,
          map: map,
          center: point.location,
          radius: radius,
        });
      });
    }

    // Cleanup
    return () => {
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
      }
    };
  }, []);

  return null;
}
