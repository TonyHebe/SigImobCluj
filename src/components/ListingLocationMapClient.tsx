"use client";

import type { LatLngExpression } from "leaflet";
import type React from "react";
import {
  MapContainer as ReactLeafletMapContainer,
  TileLayer,
  Circle,
  CircleMarker,
} from "react-leaflet";

import type { ListingLocation } from "@/lib/listings";

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

// react-leaflet v5 currently omits `center`/`zoom` from `MapContainerProps` typings,
// even though the runtime supports them. We narrow it locally to keep TS happy.
const MapContainer = ReactLeafletMapContainer as unknown as React.ComponentType<{
  center?: LatLngExpression;
  zoom?: number;
  className?: string;
  attributionControl?: boolean;
  scrollWheelZoom?: boolean;
  dragging?: boolean;
  doubleClickZoom?: boolean;
  touchZoom?: boolean;
  zoomControl?: boolean;
  children?: React.ReactNode;
}>;

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

