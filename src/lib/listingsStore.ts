"use client";

import { useEffect, useMemo, useState } from "react";

import type { Listing } from "@/lib/listings";

const STORAGE_KEY = "sig_listings_v1";
const UPDATE_EVENT = "sig_listings_updated_v1";

function assertClient() {
  if (typeof window === "undefined") {
    throw new Error("listingsStore can only be used in the browser.");
  }
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((v) => typeof v === "string" && v.trim())
  );
}

function isListingImage(value: unknown): value is Listing["images"][number] {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.src === "string" && typeof v.alt === "string";
}

function isFiniteNumber(n: unknown): n is number {
  return typeof n === "number" && Number.isFinite(n);
}

function isListingLocation(value: unknown): value is NonNullable<Listing["location"]> {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.label !== "string" || !v.label.trim()) return false;
  if (!isFiniteNumber(v.lat) || v.lat < -90 || v.lat > 90) return false;
  if (!isFiniteNumber(v.lng) || v.lng < -180 || v.lng > 180) return false;
  if (v.radiusMeters !== undefined) {
    if (!isFiniteNumber(v.radiusMeters)) return false;
    if (v.radiusMeters <= 0) return false;
  }
  return true;
}

function isListing(value: unknown): value is Listing {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const kind = v.kind;
  if (kind !== "apartment" && kind !== "house" && kind !== "land") return false;

  if (typeof v.id !== "string" || !v.id.trim()) return false;
  if (typeof v.badge !== "string") return false;
  if (typeof v.title !== "string") return false;
  if (typeof v.subtitle !== "string") return false;
  if (typeof v.price !== "string") return false;
  if (typeof v.description !== "string") return false;

  if (!isStringArray(v.details)) return false;

  if (!Array.isArray(v.images) || v.images.length < 1) return false;
  if (!v.images.every(isListingImage)) return false;

  if (v.location !== undefined && v.location !== null) {
    if (!isListingLocation(v.location)) return false;
  }

  return true;
}

function readStoredListings(): Listing[] | null {
  assertClient();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed = safeJsonParse(raw);
  if (!Array.isArray(parsed)) return null;
  const listings = parsed.filter(isListing);
  // Require a fully-valid array (avoid partial corruption).
  if (listings.length !== parsed.length) return null;
  return listings;
}

function writeStoredListings(listings: Listing[]) {
  assertClient();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function getEffectiveListings(defaults: readonly Listing[]): Listing[] {
  try {
    const stored = readStoredListings();
    return stored ?? [...defaults];
  } catch {
    return [...defaults];
  }
}

export function setListings(listings: Listing[]) {
  writeStoredListings(listings);
}

export function resetListings() {
  assertClient();
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function upsertListing(defaults: readonly Listing[], listing: Listing) {
  const current = getEffectiveListings(defaults);
  const idx = current.findIndex((l) => l.id === listing.id);
  const next = [...current];
  if (idx >= 0) next[idx] = listing;
  else next.unshift(listing);
  writeStoredListings(next);
}

export function deleteListing(defaults: readonly Listing[], id: string) {
  const current = getEffectiveListings(defaults);
  const next = current.filter((l) => l.id !== id);
  writeStoredListings(next);
}

export function getListingByIdFrom(
  defaults: readonly Listing[],
  id: string,
): Listing | null {
  const all = getEffectiveListings(defaults);
  return all.find((l) => l.id === id) ?? null;
}

export function subscribeToListingsChanges(onChange: () => void) {
  assertClient();
  const handler = () => onChange();
  window.addEventListener("storage", handler);
  window.addEventListener(UPDATE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(UPDATE_EVENT, handler);
  };
}

export function useListings(defaults: readonly Listing[]) {
  const stableDefaults = useMemo(() => [...defaults], [defaults]);
  const [listings, setState] = useState<Listing[]>(() =>
    getEffectiveListings(stableDefaults),
  );

  useEffect(() => {
    return subscribeToListingsChanges(() => {
      setState(getEffectiveListings(stableDefaults));
    });
  }, [stableDefaults]);

  return listings;
}

