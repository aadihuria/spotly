"use client";

import { useEffect, useRef } from "react";
import { Spot } from "@/types";

interface MapProps {
  spots: Spot[];
  selectedSpot?: Spot | null;
  onSpotClick?: (spot: Spot) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function StudyMap({
  spots,
  selectedSpot,
  onSpotClick,
  center = [42.2808, -83.7430],
  zoom = 14,
  height = "100%",
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    if (mapInstanceRef.current) return;
    // If container was already initialized (React strict mode double-invoke), destroy it first
    if ((mapRef.current as any)._leaflet_id) {
      (mapRef.current as any)._leaflet_id = null;
    }

    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      // Fix default marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: true }).setView(center, zoom);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      // Custom icon
      const createIcon = (color: string) => L.divIcon({
        html: `<div style="
          width:32px; height:32px;
          background:${color};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:3px solid white;
          box-shadow:0 2px 8px rgba(0,0,0,0.3);
        "></div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      // Add markers
      spots.forEach((spot) => {
        const marker = L.marker([spot.lat, spot.lng], {
          icon: createIcon("#2563eb"),
        }).addTo(map);

        marker.bindPopup(`
          <div style="min-width:180px; font-family:sans-serif;">
            <img src="${spot.image}" style="width:100%;height:80px;object-fit:cover;border-radius:8px;margin-bottom:8px;" />
            <b style="font-size:13px;">${spot.name}</b>
            <div style="font-size:11px;color:#6b7280;margin-top:2px;">${spot.address.split(",")[0]}</div>
            <div style="display:flex;align-items:center;gap:4px;margin-top:4px;">
              <span style="color:#f59e0b;font-weight:bold;font-size:12px;">★ ${spot.rating}</span>
              <span style="font-size:11px;color:#6b7280;">(${spot.total_reviews} reviews)</span>
            </div>
            <a href="/spot/${spot.id}" style="display:block;margin-top:8px;text-align:center;background:#2563eb;color:white;border-radius:8px;padding:6px;font-size:12px;font-weight:600;text-decoration:none;">View Details →</a>
          </div>
        `);

        if (onSpotClick) {
          marker.on("click", () => onSpotClick(spot));
        }

        markersRef.current.push({ marker, spot });
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Highlight selected spot
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedSpot) return;
    import("leaflet").then((L) => {
      mapInstanceRef.current.flyTo([selectedSpot.lat, selectedSpot.lng], 16, { duration: 0.8 });
    });
  }, [selectedSpot]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div ref={mapRef} style={{ height, width: "100%" }} />
    </>
  );
}
