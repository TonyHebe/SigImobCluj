import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { deleteListingById, getListingById } from "@/lib/listingsDb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAdminRequest() {
  const jar = await cookies();
  const isAuthed = jar.get("sig_auth")?.value === "1";
  const role = jar.get("sig_role")?.value ?? "user";
  return isAuthed && role === "admin";
}

export async function GET(
  _req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const listing = await getListingById(id);
    if (!listing) {
      return NextResponse.json(
        { ok: false, error: "Not found." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, listing });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  context: { params: { id: string } | Promise<{ id: string }> },
) {
  try {
    const isAdmin = await isAdminRequest();
    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const deleted = await deleteListingById(id);
    if (!deleted) {
      return NextResponse.json(
        { ok: false, error: "Not found." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

