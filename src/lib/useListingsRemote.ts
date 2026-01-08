"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Listing } from "@/lib/listings";
import { fetchListing, fetchListings } from "@/lib/listingsRemote";

export function useRemoteListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchListings();
      if (!mountedRef.current) return;
      setListings(data);
    } catch (err) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setListings([]);
    } finally {
      if (!mountedRef.current) return;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  return { listings, isLoading, error, refresh };
}

export function useRemoteListing(id: string) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    const trimmed = id.trim();
    if (!trimmed) {
      setListing(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchListing(trimmed);
      if (!mountedRef.current) return;
      setListing(data);
    } catch (err) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setListing(null);
    } finally {
      if (!mountedRef.current) return;
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();
    return () => {
      mountedRef.current = false;
    };
  }, [refresh]);

  return { listing, isLoading, error, refresh };
}

