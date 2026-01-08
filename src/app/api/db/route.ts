import { NextResponse } from "next/server";

import { getMongoClientPromise } from "@/lib/mongodb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const client = await getMongoClientPromise();
    const result = await client.db().command({ ping: 1 });

    return NextResponse.json({
      ok: true,
      ping: result.ok,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

