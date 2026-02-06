// Detect stops in route data (≥20 minutes at same location within 20m)
export function detectStops(routePoints) {
  if (!routePoints || routePoints.length < 2) return [];

  const stops = [];
  let currentStopStart = null;
  let currentStopCenter = null;

  for (let i = 1; i < routePoints.length; i++) {
    const prev = routePoints[i - 1];
    const curr = routePoints[i];

    const distance = haversineDistance(
      prev.lat, prev.lng,
      curr.lat, curr.lng
    );
    
    const timeDiff = new Date(curr.timestamp) - new Date(prev.timestamp);
    const minutes = timeDiff / (1000 * 60);

    // If moved less than 20m in 20+ minutes, it's a stop
    if (distance < 20 && minutes >= 20) {
      if (!currentStopStart) {
        // Start of a new stop
        currentStopStart = prev.timestamp;
        currentStopCenter = { lat: prev.lat, lng: prev.lng, address: prev.address };
      }
    } else {
      // Movement detected, end current stop if exists
      if (currentStopStart) {
        const stopDuration = (new Date(prev.timestamp) - new Date(currentStopStart)) / (1000 * 60);
        stops.push({
          startTime: currentStopStart,
          endTime: prev.timestamp,
          duration: Math.round(stopDuration),
          lat: currentStopCenter.lat,
          lng: currentStopCenter.lng,
          address: currentStopCenter.address || "Unknown Location"
        });
        currentStopStart = null;
        currentStopCenter = null;
      }
    }
  }

  // Handle stop that continues to the end
  if (currentStopStart) {
    const lastPoint = routePoints[routePoints.length - 1];
    const stopDuration = (new Date(lastPoint.timestamp) - new Date(currentStopStart)) / (1000 * 60);
    stops.push({
      startTime: currentStopStart,
      endTime: lastPoint.timestamp,
      duration: Math.round(stopDuration),
      lat: currentStopCenter.lat,
      lng: currentStopCenter.lng,
      address: currentStopCenter.address || "Unknown Location"
    });
  }

  return stops;
}

// Haversine distance formula in meters
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
