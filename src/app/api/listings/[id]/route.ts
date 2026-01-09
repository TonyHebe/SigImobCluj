import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { deleteListingById, getListingById } from "@/lib/listingsDb";
import { toPublicApiError } from "@/lib/serverErrors";

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
    console.error("[listings/:id] GET failed", err);
    const { status, body } = toPublicApiError(err, {
      fallbackMessage: "Unable to load listing right now.",
    });
    return NextResponse.json(body, { status });
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
    console.error("[listings/:id] DELETE failed", err);
    const { status, body } = toPublicApiError(err, {
      fallbackMessage: "Unable to delete listing right now.",
    });
    return NextResponse.json(body, { status });
  }
}

