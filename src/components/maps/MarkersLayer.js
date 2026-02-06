import { useEffect, useRef } from "react";

function createAvatarMarker(employee) {
  const container = document.createElement("div");
  container.style.width = "42px";
  container.style.height = "42px";
  container.style.borderRadius = "50%";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.background = "#fff";
  container.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
  container.style.border = `3px solid ${
    employee.status === "ONLINE"
      ? "#22c55e"
      : employee.status === "IDLE"
      ? "#f59e0b"
      : "#9ca3af"
  }`;

  // Avatar image or initials
  if (employee.avatarUrl) {
    const img = document.createElement("img");
    img.src = employee.avatarUrl;
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.borderRadius = "50%";
    container.appendChild(img);
  } else {
    const initials = document.createElement("span");
    initials.innerText = employee.name
      ?.split(" ")
      .map(w => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    initials.style.fontSize = "14px";
    initials.style.fontWeight = "600";
    initials.style.color = "#111827";
    container.appendChild(initials);
  }

  return container;
}

function createEventMarker(event) {
  const container = document.createElement("div");
  container.style.width = "48px";
  container.style.height = "48px";
  container.style.borderRadius = "50%";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.background = event.type === "STOP" ? "#dc2626" : "#fbbf24";
  container.style.color = "white";
  container.style.fontWeight = "600";
  container.style.fontSize = "16px";
  container.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
  container.style.border = "2px solid #fff";
  container.style.cursor = "pointer";
  
  // Add icon or text
  const icon = document.createElement("div");
  icon.style.fontSize = "20px";
  icon.style.marginBottom = "2px";
  icon.innerText = event.type === "STOP" ? "🛑" : "☕";
  container.appendChild(icon);
  
  return container;
}

function createClusterMarker(count, maps) {
  const container = document.createElement("div");
  container.style.width = "48px";
  container.style.height = "48px";
  container.style.borderRadius = "50%";
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.background = "#3b82f6";
  container.style.color = "white";
  container.style.fontWeight = "600";
  container.style.fontSize = "14px";
  container.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
  container.style.border = "2px solid #fff";
  container.style.cursor = "pointer";
  container.innerText = count;

  // Add hover effect
  container.addEventListener("mouseenter", () => {
    container.style.transform = "scale(1.1)";
    container.style.transition = "transform 0.2s";
  });
  container.addEventListener("mouseleave", () => {
    container.style.transform = "scale(1)";
  });

  return container;
}

function getClusterKey(lat, lng, zoom) {
  // Dynamic grid size based on zoom level
  const gridSize = Math.max(0.01, Math.pow(2, -zoom) * 0.5);
  const latGrid = Math.floor(lat / gridSize);
  const lngGrid = Math.floor(lng / gridSize);
  return `${latGrid},${lngGrid}`;
}

export default function MarkersLayer({ map, maps, employees, dailyEvents, infoWindow }) {
  const markersRef = useRef(new Map());

  // Handle live location updates via custom event
  useEffect(() => {
    function onLiveUpdate(e) {
      const data = e.detail;
      const marker = markersRef.current.get(String(data.id));
      
      // Only move if marker exists
      if (!marker) {
        console.log(`MarkersLayer: No marker found for employee ${data.id}, skipping update`);
        return;
      }
      
      const pos = new maps.LatLng(data.lat, data.lng);
      const start = marker.position || marker.getPosition?.();
      if (!start) {
        marker.position = pos;
        return;
      }
      
      const duration = 800;
      const t0 = performance.now();
      
      function step() {
        const t = Math.min((performance.now() - t0) / duration, 1);
        const lat = start.lat() + (pos.lat() - start.lat()) * t;
        const lng = start.lng() + (pos.lng() - start.lng()) * t;
        marker.position = new maps.LatLng(lat, lng);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    
    window.addEventListener("LIVE_LOCATION", onLiveUpdate);
    return () => window.removeEventListener("LIVE_LOCATION", onLiveUpdate);
  }, [maps]);

  // Create/update individual markers
  useEffect(() => {
    if (!map || !maps || !employees) return;
    
    // Clear existing markers
    markersRef.current.forEach(m => {
      if (m.setMap) m.setMap(null);
      else m.map = null;
    });
    markersRef.current.clear();
    
    // Create live employee markers
    employees.forEach((e) => {
      if (!isFinite(e.lat) || !isFinite(e.lng)) return;
      
      if (!markersRef.current.has(e.id)) {
        let marker;
        
        if (maps.marker?.AdvancedMarkerElement) {
          const content = createAvatarMarker(e);
          marker = new maps.marker.AdvancedMarkerElement({
            map,
            position: { lat: e.lat, lng: e.lng },
            content,
          });
        } else {
          marker = new maps.Marker({
            map,
            position: { lat: e.lat, lng: e.lng },
            title: e.name,
            icon: {
              path: maps.Marker.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: e.status === "ONLINE" ? "#22c55e" : e.status === "IDLE" ? "#f59e0b" : "#9ca3af",
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 2,
            },
          });
        }
        
        const clickHandler = () => {
          infoWindow.setContent(`
            <div class="max-w-xs font-sans">
              <div class="font-semibold">${e.name}</div>
              ${e.role ? `<div class="text-xs">Role: ${e.role}</div>` : ""}
              ${e.address ? `<div class="text-xs mt-1">📍 ${e.address}</div>` : ""}
              ${e.lastUpdate ? `<div class="text-xs text-gray-400 mt-1">Last: ${e.lastUpdate.toLocaleString()}</div>` : ""}
            </div>
          `);
          infoWindow.open({ map, anchor: marker });
        };
        
        if (maps.marker?.AdvancedMarkerElement) {
          marker.addEventListener("gmp-click", clickHandler);
        } else {
          marker.addListener("click", clickHandler);
        }
        
        markersRef.current.set(e.id, marker);
      } else {
        // Update position immediately
        const marker = markersRef.current.get(e.id);
        if (marker.setPosition) {
          marker.setPosition({ lat: e.lat, lng: e.lng });
        } else {
          marker.position = new maps.LatLng(e.lat, e.lng);
        }
      }
    });
    
    // Create STOP and IDLE markers from daily events
    if (dailyEvents && dailyEvents.length > 0) {
      dailyEvents.forEach((event, index) => {
        if (!isFinite(event.latitude) || !isFinite(event.longitude)) return;
        
        const markerId = `event-${event.type}-${index}`;
        let marker;
        
        if (maps.marker?.AdvancedMarkerElement) {
          const content = createEventMarker(event);
          marker = new maps.marker.AdvancedMarkerElement({
            map,
            position: { lat: event.latitude, lng: event.longitude },
            content,
          });
        } else {
          marker = new maps.Marker({
            map,
            position: { lat: event.latitude, lng: event.longitude },
            title: `${event.type} - ${event.durationMinutes}min`,
            icon: {
              path: maps.Marker.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: event.type === "STOP" ? "#dc2626" : "#fbbf24",
              fillOpacity: 0.8,
              strokeColor: "#fff",
              strokeWeight: 2,
            },
          });
        }
        
        const clickHandler = () => {
          const startTime = new Date(event.startTime);
          const endTime = new Date(event.endTime);
          
          infoWindow.setContent(`
            <div class="max-w-xs font-sans p-2">
              <div class="font-semibold text-lg mb-1">${event.type === "STOP" ? "🛑" : "☕"} ${event.type}</div>
              <div class="text-sm font-medium">${event.address || "Unknown Location"}</div>
              <div class="text-xs text-gray-600 mt-1">Duration: ${event.durationMinutes} minutes</div>
              <div class="text-xs text-gray-500 mt-1">
                ${startTime.toLocaleString()} - ${endTime.toLocaleString()}
              </div>
              <div class="text-xs font-medium mt-1">
                Status: <span class="${event.type === "STOP" ? "text-red-600" : "text-yellow-600"}">${event.type}</span>
              </div>
            </div>
          `);
          infoWindow.open({ map, anchor: marker });
        };
        
        if (maps.marker?.AdvancedMarkerElement) {
          marker.addEventListener("gmp-click", clickHandler);
        } else {
          marker.addListener("click", clickHandler);
        }
        
        markersRef.current.set(markerId, marker);
      });
    }
  }, [map, maps, employees, dailyEvents, infoWindow]);

  // Cleanup
  useEffect(() => {
    return () => {
      markersRef.current.forEach(m => {
        if (m.setMap) m.setMap(null);
        else m.map = null;
      });
      markersRef.current.clear();
    };
  }, []);

  return null;
}
