import { NextResponse } from "next/server";

import { cookies } from "next/headers";
import { deleteListingDb, getListing, parseListing, upsertListingDb } from "@/lib/listingsDb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdminRequest(): boolean {
  const c = cookies();
  return c.get("sig_auth")?.value === "1" && c.get("sig_role")?.value === "admin";
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const listing = await getListing(id);
    if (!listing) {
      return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, listing });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest()) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const body = (await req.json()) as unknown;
    const listing = parseListing({ ...(body as object), id });
    await upsertListingDb(listing);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  if (!isAdminRequest()) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await ctx.params;
    const deleted = await deleteListingDb(id);
    return NextResponse.json({ ok: true, deleted });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

