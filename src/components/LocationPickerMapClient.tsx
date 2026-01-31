"use client";

import type { LatLngExpression } from "leaflet";
import type React from "react";
import {
  MapContainer as ReactLeafletMapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  useMapEvents,
} from "react-leaflet";

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toLatLng(
  point: { lat: number; lng: number } | null | undefined,
): [number, number] | null {
  if (!point) return null;
  const lat = clampNumber(point.lat, -90, 90);
  const lng = clampNumber(point.lng, -180, 180);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

function ClickToPick({
  enabled,
  onPick,
}: {
  enabled: boolean;
  onPick?: (point: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click: (e) => {
      if (!enabled) return;
      onPick?.({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
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

export function LocationPickerMapClient({
  value,
  radiusMeters,
  onPick,
  interactive,
}: {
  value: { lat: number; lng: number } | null;
  radiusMeters?: number;
  onPick?: (point: { lat: number; lng: number }) => void;
  interactive?: boolean;
}) {
  const fallbackCenter: [number, number] = [46.7712, 23.6236]; // Cluj-Napoca
  const picked = toLatLng(value);
  const center = picked ?? fallbackCenter;
  const radius = clampNumber(radiusMeters ?? 900, 100, 5000);

  return (
    <MapContainer
      center={center}
      zoom={picked ? 13 : 12}
      scrollWheelZoom={Boolean(interactive)}
      dragging={Boolean(interactive)}
      doubleClickZoom={Boolean(interactive)}
      touchZoom={Boolean(interactive)}
      zoomControl={Boolean(interactive)}
      className="h-full w-full"
      attributionControl={Boolean(interactive)}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <ClickToPick enabled={Boolean(interactive)} onPick={onPick} />

      {picked ? (
        <>
          <Circle
            center={picked}
            radius={radius}
            pathOptions={{
              color: "#0ea5e9",
              weight: 2,
              fillColor: "#0ea5e9",
              fillOpacity: 0.16,
            }}
          />
          <CircleMarker
            center={picked}
            radius={7}
            pathOptions={{
              color: "#0ea5e9",
              weight: 2,
              fillColor: "#0ea5e9",
              fillOpacity: 1,
            }}
          />
        </>
      ) : null}
    </MapContainer>
  );
}

