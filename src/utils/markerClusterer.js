// Simple marker clustering implementation
export function createMarkerClusterer(map, maps, markers, maxZoom = 15) {
  const clusters = new Map();
  const clusterMarkers = new Map();

  function getClusterKey(lat, lng) {
    const gridSize = 0.01; // ~1km grid
    const latGrid = Math.floor(lat / gridSize);
    const lngGrid = Math.floor(lng / gridSize);
    return `${latGrid},${lngGrid}`;
  }

  function updateClusters() {
    // Clear existing clusters
    clusterMarkers.forEach(marker => marker.setMap(null));
    clusterMarkers.clear();
    clusters.clear();

    const zoom = map.getZoom();
    if (zoom >= maxZoom) {
      // Show individual markers at high zoom
      markers.forEach(marker => marker.setMap(map));
      return;
    }

    // Group markers into clusters
    markers.forEach(marker => {
      const pos = marker.getPosition ? marker.getPosition() : { lat: marker.position.lat(), lng: marker.position.lng() };
      const key = getClusterKey(pos.lat, pos.lng);
      
      if (!clusters.has(key)) {
        clusters.set(key, []);
      }
      clusters.get(key).push(marker);
    });

    // Create cluster markers
    clusters.forEach((clusterMarkers, key) => {
      if (clusterMarkers.length === 1) {
        clusterMarkers[0].setMap(map);
      } else {
        // Calculate cluster center
        const avgLat = clusterMarkers.reduce((sum, m) => {
          const pos = m.getPosition ? m.getPosition() : { lat: m.position.lat(), lng: m.position.lng() };
          return sum + pos.lat;
        }, 0) / clusterMarkers.length;
        
        const avgLng = clusterMarkers.reduce((sum, m) => {
          const pos = m.getPosition ? m.getPosition() : { lat: m.position.lat(), lng: m.position.lng() };
          return sum + pos.lng;
        }, 0) / clusterMarkers.length;

        // Create cluster marker
        const clusterDiv = document.createElement('div');
        clusterDiv.style.width = '40px';
        clusterDiv.style.height = '40px';
        clusterDiv.style.borderRadius = '50%';
        clusterDiv.style.background = '#3b82f6';
        clusterDiv.style.color = 'white';
        clusterDiv.style.display = 'flex';
        clusterDiv.style.alignItems = 'center';
        clusterDiv.style.justifyContent = 'center';
        clusterDiv.style.fontWeight = '600';
        clusterDiv.style.fontSize = '12px';
        clusterDiv.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        clusterDiv.innerText = clusterMarkers.length;

        const clusterMarker = new maps.marker.AdvancedMarkerElement({
          map,
          position: { lat: avgLat, lng: avgLng },
          content: clusterDiv,
        });

        // Click to zoom into cluster
        clusterMarker.addEventListener('gmp-click', () => {
          map.setZoom(Math.min(zoom + 2, maxZoom));
          map.panTo({ lat: avgLat, lng: avgLng });
        });

        clusterMarkers.set(key, clusterMarker);
      }
    });
  }

  // Update clusters on zoom change
  maps.event.addListener(map, 'zoom_changed', updateClusters);

  // Initial clustering
  updateClusters();

  return {
    updateClusters,
    cleanup: () => {
      clusterMarkers.forEach(marker => marker.setMap(null));
      maps.event.clearListeners(map, 'zoom_changed');
    }
  };
}
