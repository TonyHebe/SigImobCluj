"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import type { Listing } from "@/lib/listings";
import type { MapListing, SimpleBounds } from "@/components/ListingsMapClient";

const ListingsMap = dynamic(
  () => import("@/components/ListingsMapClient").then((m) => m.ListingsMapClient),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center text-sm text-slate-600">
        Se încarcă harta…
      </div>
    ),
  },
);

function toMapListings(listings: Listing[]): MapListing[] {
  return listings
    .filter((l) => Boolean(l.location))
    .map((l) => ({
      id: l.id,
      title: l.title,
      price: l.price,
      location: l.location!,
    }));
}

export function ListingsMapCard({
  listings,
  onBoundsChange,
  fitToPoints,
  mapKey,
}: {
  listings: Listing[];
  onBoundsChange?: (bounds: SimpleBounds) => void;
  fitToPoints?: boolean;
  /** Used to force a remount (reset) of the map. */
  mapKey?: number;
}) {
  const mapListings = useMemo(() => toMapListings(listings), [listings]);

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">Hartă</div>
          <div className="mt-1 text-xs text-slate-500">
            Pin-urile sunt locații aproximative (fără adresă exactă).
          </div>
        </div>
        <div className="shrink-0 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
          {mapListings.length} cu locație
        </div>
      </div>

      <div className="h-[420px] w-full bg-slate-50">
        <ListingsMap
          key={mapKey ?? 0}
          listings={mapListings}
          onBoundsChange={onBoundsChange}
          fitToPoints={fitToPoints}
        />
      </div>
    </div>
  );
}

