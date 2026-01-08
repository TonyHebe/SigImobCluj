import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { resetListingsToDefaults } from "@/lib/listingsDb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAdminRequest() {
  const jar = await cookies();
  const isAuthed = jar.get("sig_auth")?.value === "1";
  const role = jar.get("sig_role")?.value ?? "user";
  return isAuthed && role === "admin";
}

export async function POST() {
  try {
    const isAdmin = await isAdminRequest();
    if (!isAdmin) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized." },
        { status: 401 },
      );
    }

    const inserted = await resetListingsToDefaults();
    return NextResponse.json({ ok: true, inserted });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

