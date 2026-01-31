"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useMemo, useState } from "react";

const LocationPickerMap = dynamic(
  () =>
    import("@/components/LocationPickerMapClient").then(
      (m) => m.LocationPickerMapClient,
    ),
  { ssr: false },
);

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseOptionalNumber(value: string): number | null {
  const raw = value.trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function formatCoord(value: number) {
  // Enough precision for map pins without looking messy.
  return value.toFixed(6);
}

function formatRadiusLabel(radiusMeters: number) {
  if (radiusMeters >= 1000) {
    const km = radiusMeters / 1000;
    return `${km.toFixed(km >= 10 ? 0 : 1)} km`;
  }
  return `${Math.round(radiusMeters)} m`;
}

export function AdminListingLocationPicker({
  label,
  lat,
  lng,
  radiusMeters,
  onChange,
}: {
  label: string;
  lat: string;
  lng: string;
  radiusMeters: string;
  onChange: (patch: Partial<{ lat: string; lng: string; radiusMeters: string }>) => void;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  const parsedLat = parseOptionalNumber(lat);
  const parsedLng = parseOptionalNumber(lng);
  const hasCoords = parsedLat != null && parsedLng != null;
  const picked = useMemo(
    () => (hasCoords ? { lat: parsedLat!, lng: parsedLng! } : null),
    [hasCoords, parsedLat, parsedLng],
  );

  const radius = useMemo(() => {
    const r = parseOptionalNumber(radiusMeters);
    return clampNumber(r ?? 900, 100, 5000);
  }, [radiusMeters]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs text-slate-500">
            Click pe mini-hartă → se deschide harta mare → click unde vrei pin-ul.
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
              onClick={() => setOpen(true)}
            >
              {hasCoords ? "Schimbă locația pe hartă" : "Alege locația pe hartă"}
            </button>
            {hasCoords ? (
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 shadow-sm hover:bg-rose-100"
                onClick={() => onChange({ lat: "", lng: "" })}
              >
                Șterge pin
              </button>
            ) : null}
          </div>

          <div className="mt-3 text-xs text-slate-600">
            {hasCoords ? (
              <>
                Coordonate:{" "}
                <span className="font-semibold text-slate-900">
                  {formatCoord(parsedLat!)}, {formatCoord(parsedLng!)}
                </span>{" "}
                • Rază:{" "}
                <span className="font-semibold text-slate-900">
                  {formatRadiusLabel(radius)}
                </span>
              </>
            ) : (
              <>Nu ai pin setat încă.</>
            )}
          </div>
        </div>

        <button
          type="button"
          className="group relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm sm:w-56"
          onClick={() => setOpen(true)}
          aria-label="Deschide harta pentru alegere locație"
        >
          <div className="relative h-28 w-full sm:h-24">
            <LocationPickerMap value={picked} radiusMeters={radius} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/30 via-slate-950/10 to-transparent p-2 text-left">
              <div className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-900 shadow-sm">
                Click pentru selectare
              </div>
            </div>
          </div>
        </button>
      </div>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed inset-0 z-50"
        >
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                <div className="min-w-0">
                  <div
                    id={titleId}
                    className="truncate text-sm font-semibold text-slate-900"
                  >
                    {label.trim() ? label.trim() : "Alege locația (aproximativă)"}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Click pe hartă pentru a seta pin-ul. (Nu folosim adresă exactă.)
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 text-sm font-semibold text-rose-800 shadow-sm hover:bg-rose-100"
                    onClick={() => onChange({ lat: "", lng: "" })}
                  >
                    Șterge pin
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                    onClick={() => setOpen(false)}
                  >
                    Închide
                  </button>
                </div>
              </div>

              <div className="h-[62vh] w-full bg-slate-50">
                <LocationPickerMap
                  value={picked}
                  radiusMeters={radius}
                  interactive
                  onPick={(pt) =>
                    onChange({ lat: formatCoord(pt.lat), lng: formatCoord(pt.lng) })
                  }
                />
              </div>

              <div className="grid gap-4 border-t border-slate-200 px-5 py-4 sm:grid-cols-3">
                <div className="grid gap-1 text-sm">
                  <div className="font-semibold text-slate-900">Lat / Lng</div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-700">
                    {hasCoords
                      ? `${formatCoord(parsedLat!)}, ${formatCoord(parsedLng!)}`
                      : "—"}
                  </div>
                </div>

                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-slate-900">Rază (metri)</span>
                  <input
                    inputMode="numeric"
                    value={radiusMeters}
                    onChange={(e) => onChange({ radiusMeters: e.target.value })}
                    placeholder="900"
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                  <span className="text-xs text-slate-500">
                    Recomandat: 700–1500 m (aproximativ).
                  </span>
                </label>

                <label className="grid gap-1 text-sm">
                  <span className="font-semibold text-slate-900">Ajustează rapid</span>
                  <input
                    type="range"
                    min={100}
                    max={5000}
                    step={50}
                    value={radius}
                    onChange={(e) => onChange({ radiusMeters: e.target.value })}
                    className="h-11 w-full accent-sky-600"
                  />
                  <span className="text-xs text-slate-500">
                    Curent: {formatRadiusLabel(radius)}
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

