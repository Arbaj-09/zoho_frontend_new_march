"use client";

import { useEffect, useRef } from "react";

const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };
const DEFAULT_ZOOM = 12;

// Global flags to prevent multiple loads
let isGoogleMapsLoaded = false;
let isMapInitialized = false;

export default function MapCanvas({ apiKey, onMapReady }) {
  const mapDivRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    // Strict prevention of multiple initializations
    if (!apiKey || isMapInitialized) {
      console.log("MapCanvas: Skipping - apiKey:", !!apiKey, "isMapInitialized:", isMapInitialized);
      return;
    }

    // Check if Google Maps already loaded
    if (window.google?.maps) {
      console.log("MapCanvas: Google Maps already loaded, initializing map");
      initializeMap();
      return;
    }

    // Check if script already exists in DOM
    const existingScript = document.getElementById("google-maps-script");
    if (existingScript) {
      console.log("MapCanvas: Script exists, waiting for load");
      if (isGoogleMapsLoaded) {
        initializeMap();
      } else {
        // Wait for script to load
        existingScript.addEventListener('load', initializeMap, { once: true });
      }
      return;
    }

    // Load Google Maps script
    console.log("MapCanvas: Loading Google Maps script");
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=marker,visualization&callback=initMap&loading=async`;
    script.async = true;
    script.defer = true;
    
    window.initMap = () => {
      console.log("MapCanvas: Google Maps callback triggered");
      isGoogleMapsLoaded = true;
      initializeMap();
    };

    script.onerror = (error) => {
      console.error("MapCanvas: Failed to load Google Maps script", error);
    };

    document.head.appendChild(script);

    function initializeMap() {
      if (isMapInitialized || !mapDivRef.current) {
        console.log("MapCanvas: initializeMap skipped - already initialized or no ref");
        return;
      }

      try {
        const { Map, InfoWindow, visualization } = window.google.maps;
        mapRef.current = new Map(mapDivRef.current, {
          center: DEFAULT_CENTER,
          zoom: DEFAULT_ZOOM,
          mapId: "employee_tracking_map",
        });

        const info = new InfoWindow();
        isMapInitialized = true;
        console.log("MapCanvas: Map initialized successfully");
        
        if (onMapReady) {
          onMapReady(mapRef.current, window.google.maps, visualization);
        }
      } catch (error) {
        console.error("MapCanvas: Failed to initialize map", error);
      }
    }

    return () => {
      // Cleanup only the callback, not the script
      if (window.initMap) {
        delete window.initMap;
      }
    };
  }, [apiKey, onMapReady]);

  return (
    <div
      ref={mapDivRef}
      className="w-full h-full rounded-xl border border-gray-200"
      style={{ minHeight: "600px", backgroundColor: "#f3f4f6" }}
    />
  );
}
