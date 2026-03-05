"use client";

/**
 * MapView — Mapa real com Leaflet (OpenStreetMap)
 * Leaflet é importado dinamicamente para evitar erros de SSR ("window is not defined").
 */
import { useEffect, useRef } from "react";
import { User, GeoLocation, calcDistance, formatDistance } from "@/lib/bioloTypes";

interface Props {
  professionals: User[];
  userLocation: GeoLocation | null;
  onSelectWorker?: (w: User) => void;
  height?: string;
}

export default function MapView({ professionals, userLocation, onSelectWorker, height = "240px" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);

  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [-8.8368, 13.2343];

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !containerRef.current) return;

      // Fix default icon paths broken by bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(containerRef.current, {
        center,
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      if (userLocation) {
        const userIcon = L.divIcon({
          className: "",
          html: `<div style="width:16px;height:16px;border-radius:50%;background:hsl(var(--primary));border:3px solid white;box-shadow:0 0 0 4px hsl(var(--primary)/0.25);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup("<b>A tua localização</b>");
      }

      professionals.forEach((w) => {
        if (!w.location) return;
        const dist = userLocation ? calcDistance(userLocation, w.location) : null;
        const distLabel = dist !== null ? formatDistance(dist) : "";

        const pin = L.divIcon({
          className: "",
          html: `<div style="width:36px;height:36px;border-radius:50%;background:${w.avatarColor};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:11px;cursor:pointer;opacity:${w.available ? 1 : 0.55};">${w.avatar[0]}</div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        const popup = L.popup({ closeButton: false, offset: [0, -18] }).setContent(`
          <div style="font-family:system-ui;min-width:160px;padding:4px 0">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <div style="width:32px;height:32px;border-radius:50%;background:${w.avatarColor};display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:12px;flex-shrink:0">${w.avatar}</div>
              <div>
                <p style="font-weight:700;font-size:13px;margin:0">${w.name}</p>
                <p style="color:#6b7280;font-size:11px;margin:0">${w.profession}</p>
              </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px">
              <span style="font-weight:600;color:${w.available ? "#16a34a" : "#6b7280"}">${w.available ? "● Disponível" : "○ Ocupado"}</span>
              ${distLabel ? `<span style="color:#6b7280">${distLabel}</span>` : ""}
            </div>
            <p style="font-weight:700;font-size:13px;margin:6px 0 0">${w.pricePerHour}</p>
            ${onSelectWorker ? `<button onclick="window.__bioloSelectWorker('${w.id}')" style="margin-top:8px;width:100%;background:hsl(142.1 76.2% 36.3%);color:white;border:none;border-radius:8px;padding:6px;font-size:12px;font-weight:700;cursor:pointer">Ver perfil →</button>` : ""}
          </div>
        `);

        const marker = L.marker([w.location.lat, w.location.lng], { icon: pin })
          .addTo(map)
          .bindPopup(popup);
        marker.on("click", () => marker.openPopup());
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__bioloSelectWorker = (id: string) => {
        const w = professionals.find((p) => p.id === id);
        if (w && onSelectWorker) onSelectWorker(w);
      };

      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__bioloSelectWorker;
    };
  }, [professionals, userLocation]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%", borderRadius: "1rem", overflow: "hidden" }}
    />
  );
}
