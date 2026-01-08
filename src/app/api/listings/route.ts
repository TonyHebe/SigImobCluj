import { NextResponse } from "next/server";

import { cookies } from "next/headers";
import {
  ensureListingsSeededIfEmpty,
  listListings,
  parseListing,
  upsertListingDb,
} from "@/lib/listingsDb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdminRequest(): boolean {
  const c = cookies();
  return c.get("sig_auth")?.value === "1" && c.get("sig_role")?.value === "admin";
}

export async function GET() {
  try {
    await ensureListingsSeededIfEmpty();
    const listings = await listListings();
    return NextResponse.json({ ok: true, listings });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAdminRequest()) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await req.json()) as unknown;
    const listing = parseListing(body);
    await upsertListingDb(listing);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

