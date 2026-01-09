import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { Listing } from "@/lib/listings";
import { getAllListings, upsertListing } from "@/lib/listingsDb";
import { toPublicApiError } from "@/lib/serverErrors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    const listings = await getAllListings();
    return NextResponse.json({ ok: true, listings });
  } catch (err) {
    console.error("[listings] GET failed", err);
    const { status, body } = toPublicApiError(err, {
      fallbackMessage: "Unable to load listings right now.",
    });
    return NextResponse.json(body, { status });
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
    return NextResponse.json({ ok: true, listing });
  } catch (err) {
    console.error("[listings] POST failed", err);
    const { status, body } = toPublicApiError(err, {
      fallbackMessage: "Unable to save listing right now.",
    });
    return NextResponse.json(body, { status });
  }
}

