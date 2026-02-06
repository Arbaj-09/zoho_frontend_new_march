import React, { useEffect, useRef } from "react";

export default function ClusteringLayer({ map, maps, markers }) {
  const markerClusterRef = useRef(null);

  useEffect(() => {
    if (!map || !maps || !markers || markers.length === 0) {
      if (markerClusterRef.current) {
        markerClusterRef.current.setMap(null);
        markerClusterRef.current = null;
      }
      return;
    }

    // Load markerclustererplus script if not already loaded
    if (!window.MarkerClusterer) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/@googlemaps/markerclustererplus@5.0.4/dist/index.min.js";
      script.async = true;
      script.onload = () => {
        markerClusterRef.current = new window.MarkerClusterer(map, markers, {
          imagePath: "https://unpkg.com/@googlemaps/markerclustererplus@5.0.4/images/m",
        });
      };
      document.head.appendChild(script);
    } else {
      markerClusterRef.current = new window.MarkerClusterer(map, markers, {
        imagePath: "https://unpkg.com/@googlemaps/markerclustererplus@5.0.4/images/m",
      });
    }

    return () => {
      if (markerClusterRef.current) {
        markerClusterRef.current.setMap(null);
        markerClusterRef.current = null;
      }
    };
  }, [map, maps, markers]);

  return null;
}
