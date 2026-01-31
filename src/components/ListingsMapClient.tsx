"use client";

import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import type React from "react";
import { useEffect, useMemo } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer as ReactLeafletMapContainer,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";

import type { ListingLocation } from "@/lib/listings";

export type SimpleBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type MapListing = {
  id: string;
  title: string;
  price: string;
  location: ListingLocation;
};

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toLatLng(location: ListingLocation): [number, number] {
  const lat = clampNumber(location.lat, -90, 90);
  const lng = clampNumber(location.lng, -180, 180);
  return [lat, lng];
}

function computeBounds(points: Array<[number, number]>): LatLngBoundsExpression | null {
  if (!points.length) return null;
  let minLat = points[0]![0];
  let maxLat = points[0]![0];
  let minLng = points[0]![1];
  let maxLng = points[0]![1];
  for (const [lat, lng] of points) {
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
  }
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ] satisfies LatLngBoundsExpression;
}

function FitToPoints({
  points,
  enabled,
}: {
  points: Array<[number, number]>;
  enabled: boolean;
}) {
  const map = useMap();
  const bounds = useMemo(() => computeBounds(points), [points]);

  useEffect(() => {
    if (!enabled) return;
    if (!bounds) return;
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 14 });
  }, [bounds, enabled, map]);

  return null;
}

function BoundsReporter({
  onBoundsChange,
}: {
  onBoundsChange?: (bounds: SimpleBounds) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      onBoundsChange?.({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    },
    zoomend: () => {
      const b = map.getBounds();
      onBoundsChange?.({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    },
  });

  useEffect(() => {
    const b = map.getBounds();
    onBoundsChange?.({
      north: b.getNorth(),
      south: b.getSouth(),
      east: b.getEast(),
      west: b.getWest(),
    });
  }, [map, onBoundsChange]);

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

export function ListingsMapClient({
  listings,
  onBoundsChange,
  fitToPoints,
}: {
  listings: MapListing[];
  onBoundsChange?: (bounds: SimpleBounds) => void;
  /** When true, re-fit the map to all points (useful on mount/reset). */
  fitToPoints?: boolean;
}) {
  const points = useMemo(() => listings.map((l) => toLatLng(l.location)), [listings]);
  const bounds = useMemo(() => computeBounds(points), [points]);

  const fallbackCenter: [number, number] = [46.7712, 23.6236]; // Cluj-Napoca (center)
  const center: [number, number] = (() => {
    if (!points.length) return fallbackCenter;
    const lat = points.reduce((acc, p) => acc + p[0], 0) / points.length;
    const lng = points.reduce((acc, p) => acc + p[1], 0) / points.length;
    return [lat, lng];
  })();

  const showRadii = listings.length > 0 && listings.length <= 30;

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom
      dragging
      doubleClickZoom
      touchZoom
      zoomControl
      className="h-full w-full"
      attributionControl
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />

      <BoundsReporter onBoundsChange={onBoundsChange} />
      <FitToPoints points={points} enabled={Boolean(fitToPoints) && Boolean(bounds)} />

      {listings.map((l) => {
        const center = toLatLng(l.location);
        const radius = clampNumber(l.location.radiusMeters ?? 900, 100, 5000);
        return (
          <div key={l.id}>
            {showRadii ? (
              <Circle
                center={center}
                radius={radius}
                pathOptions={{
                  color: "#0ea5e9",
                  weight: 1,
                  fillColor: "#0ea5e9",
                  fillOpacity: 0.08,
                }}
              />
            ) : null}
            <CircleMarker
              center={center}
              radius={7}
              pathOptions={{
                color: "#0284c7",
                weight: 2,
                fillColor: "#38bdf8",
                fillOpacity: 1,
              }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <div className="text-sm font-semibold text-slate-900">{l.title}</div>
                  <div className="mt-1 text-xs text-slate-600">{l.price}</div>
                  <a
                    href={`/oferte/${encodeURIComponent(l.id)}`}
                    className="mt-2 inline-block text-xs font-semibold text-sky-700 hover:text-sky-800"
                  >
                    Vezi detalii
                  </a>
                  <div className="mt-2 text-[11px] text-slate-500">
                    Locație aproximativă (± {Math.round(radius)} m)
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          </div>
        );
      })}
    </MapContainer>
  );
}

