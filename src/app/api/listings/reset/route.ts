import { NextResponse } from "next/server";

import { cookies } from "next/headers";
import { resetListingsDb } from "@/lib/listingsDb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdminRequest(): boolean {
  const c = cookies();
  return c.get("sig_auth")?.value === "1" && c.get("sig_role")?.value === "admin";
}

export async function POST() {
  if (!isAdminRequest()) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  try {
    await resetListingsDb();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

