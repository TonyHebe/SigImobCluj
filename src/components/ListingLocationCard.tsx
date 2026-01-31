"use client";

import dynamic from "next/dynamic";
import { useEffect, useId, useMemo, useState } from "react";

import type { ListingLocation } from "@/lib/listings";

const ListingLocationMap = dynamic(
  () =>
    import("@/components/ListingLocationMapClient").then(
      (m) => m.ListingLocationMapClient,
    ),
  { ssr: false },
);

function formatRadius(radiusMeters: number | undefined) {
  if (!radiusMeters) return null;
  if (radiusMeters >= 1000) {
    const km = radiusMeters / 1000;
    return `${km.toFixed(km >= 10 ? 0 : 1)} km`;
  }
  return `${Math.round(radiusMeters)} m`;
}

export function ListingLocationCard({
  location,
}: {
  location: ListingLocation;
}) {
  const [open, setOpen] = useState(false);
  const titleId = useId();

  const radiusText = useMemo(
    () => formatRadius(location.radiusMeters),
    [location.radiusMeters],
  );

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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900">Localitate</div>
            <div className="mt-1 text-sm text-slate-600">{location.label}</div>
            <div className="mt-2 text-xs text-slate-500">
              Locație aproximativă{radiusText ? ` (± ${radiusText})` : ""}.
            </div>

            <button
              type="button"
              className="mt-3 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
              onClick={() => setOpen(true)}
            >
              Vezi locația pe hartă
            </button>
          </div>

          <button
            type="button"
            className="group relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm sm:w-44"
            onClick={() => setOpen(true)}
            aria-label="Deschide harta"
          >
            <div className="relative h-28 w-full sm:h-24">
              <ListingLocationMap location={location} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/30 via-slate-950/10 to-transparent p-2 text-left">
                <div className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-900 shadow-sm">
                  Click pentru hartă mare
                </div>
              </div>
            </div>
          </button>
        </div>
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
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                <div className="min-w-0">
                  <div
                    id={titleId}
                    className="truncate text-sm font-semibold text-slate-900"
                  >
                    {location.label}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Locație aproximativă{radiusText ? ` (± ${radiusText})` : ""}.
                  </div>
                </div>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                  onClick={() => setOpen(false)}
                >
                  Închide
                </button>
              </div>
              <div className="h-[70vh] w-full bg-slate-50">
                <ListingLocationMap location={location} interactive />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

