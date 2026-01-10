import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { Listing } from "@/lib/listings";
import { getCachedListings } from "@/lib/listingsCache.server";
import { upsertListing } from "@/lib/listingsDb";

export const runtime = "nodejs";

async function isAdminRequest() {
  // Next 16: `cookies()` is async.
  const jar = await cookies();
  const isAuthed = jar.get("sig_auth")?.value === "1";
  const role = jar.get("sig_role")?.value ?? "user";
  return isAuthed && role === "admin";
}

function isListingLike(value: unknown): value is Listing {
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
  if (!Array.isArray(v.details) || !v.details.every((d) => typeof d === "string"))
    return false;
  if (
    !Array.isArray(v.images) ||
    v.images.length < 1 ||
    !v.images.every((img) => {
      if (!img || typeof img !== "object") return false;
      const i = img as Record<string, unknown>;
      return typeof i.src === "string" && typeof i.alt === "string";
    })
  ) {
    return false;
  }
  return true;
}

export async function GET() {
  try {
    const listings = await getCachedListings();
    return NextResponse.json(
      { ok: true, listings },
      {
        headers: {
          // Cache at the edge/CDN when available; still safe because GET is public.
          "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const isAdmin = await isAdminRequest();
    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const body = (await req.json()) as unknown;
    if (!isListingLike(body)) {
      return NextResponse.json(
        { ok: false, error: "Invalid listing payload." },
        { status: 400 },
      );
    }

    const listing = await upsertListing(body);
    revalidateTag("listings", "default");
    return NextResponse.json({ ok: true, listing });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

