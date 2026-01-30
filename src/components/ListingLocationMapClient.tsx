"use client";

import { MapContainer, TileLayer, Circle, CircleMarker } from "react-leaflet";

import type { ListingLocation } from "@/lib/listings";

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ListingLocationMapClient({
  location,
  interactive,
}: {
  location: ListingLocation;
  interactive?: boolean;
}) {
  const lat = clampNumber(location.lat, -90, 90);
  const lng = clampNumber(location.lng, -180, 180);
  const radius = clampNumber(location.radiusMeters ?? 900, 100, 5000);
  const center: [number, number] = [lat, lng];

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={Boolean(interactive)}
      dragging={Boolean(interactive)}
      doubleClickZoom={Boolean(interactive)}
      touchZoom={Boolean(interactive)}
      zoomControl={Boolean(interactive)}
      className="h-full w-full"
      attributionControl={Boolean(interactive)}
    >
      <TileLayer
        // OSM tiles (no API key). For production scale, consider a paid tile provider.
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <Circle
        center={center}
        radius={radius}
        pathOptions={{
          color: "#0ea5e9",
          weight: 2,
          fillColor: "#0ea5e9",
          fillOpacity: 0.16,
        }}
      />
      <CircleMarker
        center={center}
        radius={6}
        pathOptions={{
          color: "#0ea5e9",
          weight: 2,
          fillColor: "#0ea5e9",
          fillOpacity: 1,
        }}
      />
    </MapContainer>
  );
}

