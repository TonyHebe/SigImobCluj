import { useCallback, useEffect, useMemo, useState } from "react";

import type { Listing } from "@/lib/listings";

type ApiOk<T> = { ok: true } & T;
type ApiErr = { ok: false; error: string };

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(text || `HTTP ${res.status}`);
  }
}

export function useRemoteListings(fallback: readonly Listing[]) {
  const [listings, setListings] = useState<Listing[]>(() => [...fallback]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/listings", { cache: "no-store" });
      const data = await readJson<ApiOk<{ listings: Listing[] }> | ApiErr>(res);
      if (!data.ok) throw new Error(data.error);
      setListings(data.listings);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setListings([...fallback]);
    } finally {
      setIsLoading(false);
    }
  }, [fallback]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return useMemo(
    () => ({ listings, isLoading, error, refresh }),
    [listings, isLoading, error, refresh],
  );
}

export async function upsertRemoteListing(listing: Listing) {
  const res = await fetch("/api/listings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(listing),
  });
  const data = await readJson<ApiOk<Record<string, never>> | ApiErr>(res);
  if (!data.ok) throw new Error(data.error);
}

export async function deleteRemoteListing(id: string) {
  const res = await fetch(`/api/listings/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const data = await readJson<ApiOk<{ deleted: boolean }> | ApiErr>(res);
  if (!data.ok) throw new Error(data.error);
  return data.deleted;
}

export async function resetRemoteListings() {
  const res = await fetch("/api/listings/reset", { method: "POST" });
  const data = await readJson<ApiOk<Record<string, never>> | ApiErr>(res);
  if (!data.ok) throw new Error(data.error);
}

