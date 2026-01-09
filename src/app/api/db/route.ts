import { NextResponse } from "next/server";

import { getMongoClientPromise } from "@/lib/mongodb";
import { toPublicApiError } from "@/lib/serverErrors";

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
    console.error("[db/ping] failed", err);
    const { status, body } = toPublicApiError(err, {
      fallbackMessage: "Database unavailable.",
      fallbackStatus: 503,
    });
    return NextResponse.json(body, { status });
  }
}

