"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Listing } from "@/lib/listings";
import { fetchListing, fetchListings } from "@/lib/listingsRemote";

function errorToMessage(err: unknown) {
  if (err instanceof Error && err.message.trim()) return err.message;
  if (typeof err === "string" && err.trim()) return err;
  return "Unknown error.";
}

export function useListingsRemote(options?: {
  enabled?: boolean;
  initial?: Listing[];
}) {
  const enabled = options?.enabled ?? true;
  const initial = useMemo(() => options?.initial ?? [], [options?.initial]);

  const [listings, setListings] = useState<Listing[]>(initial);
  const [isLoading, setIsLoading] = useState<boolean>(enabled && initial.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const initialAppliedRef = useRef(false);
  useEffect(() => {
    if (initialAppliedRef.current) return;
    initialAppliedRef.current = true;
    setListings(initial);
  }, [initial]);

  const refetch = useCallback(() => {
    setRefreshToken((x) => x + 1);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();
    let cancelled = false;

    // Only show an "initial loading" state when we have no data yet.
    // When `initial` listings are provided (SSR), we treat refresh as background.
    if (listings.length === 0) setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const next = await fetchListings({ signal: controller.signal });
        if (cancelled) return;
        setListings(next);
      } catch (err) {
        if (cancelled) return;
        // Ignore abort errors.
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(errorToMessage(err));
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, refreshToken]);

  return { listings, isLoading, error, refetch };
}

export function useListingRemote(
  id: string,
  options?: { enabled?: boolean; initial?: Listing | null },
) {
  const enabled = (options?.enabled ?? true) && Boolean(id);
  const initial = options?.initial ?? null;

  const [listing, setListing] = useState<Listing | null>(initial);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const refetch = useCallback(() => {
    setRefreshToken((x) => x + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    setIsLoading(true);
    setError(null);

    void (async () => {
      try {
        const next = await fetchListing(id, { signal: controller.signal });
        if (cancelled) return;
        setListing(next);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(errorToMessage(err));
      } finally {
        if (cancelled) return;
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [enabled, id, refreshToken]);

  return { listing, isLoading, error, refetch };
}

