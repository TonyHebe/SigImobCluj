import "server-only";

import { unstable_cache } from "next/cache";

import type { Listing } from "@/lib/listings";
import { getAllListings } from "@/lib/listingsDb";

/**
 * Cached, tag-invalidatable listings fetch.
 *
 * - Keeps `/listari` fast on repeat visits.
 * - Admin writes (`POST/DELETE/reset`) call `revalidateTag("listings")`.
 */
export const getCachedListings = unstable_cache(
  async (): Promise<Listing[]> => getAllListings(),
  ["sig:listings:all"],
  { tags: ["listings"], revalidate: 60 },
);

