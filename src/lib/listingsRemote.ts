import type { Listing } from "@/lib/listings";

type ApiOk<T> = { ok: true } & T;
type ApiErr = { ok: false; error: string };

type FetchOptions = {
  signal?: AbortSignal;
};

async function readJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

function errorFromResponse(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    if (typeof p.error === "string" && p.error.trim()) return p.error;
  }
  return fallback;
}

export async function fetchListings(options?: FetchOptions): Promise<Listing[]> {
  const res = await fetch("/api/listings", {
    method: "GET",
    credentials: "same-origin",
    signal: options?.signal,
  });
  const payload = await readJson<ApiOk<{ listings: Listing[] }> | ApiErr>(res);
  if (!res.ok || !payload.ok) {
    throw new Error(errorFromResponse(payload, "Failed to load listings."));
  }
  return payload.listings;
}

export async function fetchListing(
  id: string,
  options?: FetchOptions,
): Promise<Listing | null> {
  const res = await fetch(`/api/listings/${encodeURIComponent(id)}`, {
    method: "GET",
    credentials: "same-origin",
    signal: options?.signal,
  });
  if (res.status === 404) return null;
  const payload = await readJson<ApiOk<{ listing: Listing }> | ApiErr>(res);
  if (!res.ok || !payload.ok) {
    throw new Error(errorFromResponse(payload, "Failed to load listing."));
  }
  return payload.listing;
}

export async function saveListing(listing: Listing): Promise<Listing> {
  const res = await fetch("/api/listings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "same-origin",
    body: JSON.stringify(listing),
  });
  const payload = await readJson<ApiOk<{ listing: Listing }> | ApiErr>(res);
  if (!res.ok || !payload.ok) {
    throw new Error(errorFromResponse(payload, "Failed to save listing."));
  }
  return payload.listing;
}

export async function deleteListingRemote(id: string): Promise<void> {
  const res = await fetch(`/api/listings/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "same-origin",
  });
  const payload = await readJson<ApiOk<Record<string, never>> | ApiErr>(res);
  if (!res.ok || !payload.ok) {
    throw new Error(errorFromResponse(payload, "Failed to delete listing."));
  }
}

export async function resetListingsRemote(): Promise<void> {
  const res = await fetch("/api/listings/reset", {
    method: "POST",
    credentials: "same-origin",
  });
  const payload = await readJson<ApiOk<Record<string, never>> | ApiErr>(res);
  if (!res.ok || !payload.ok) {
    throw new Error(errorFromResponse(payload, "Failed to reset listings."));
  }
}

