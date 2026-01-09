export class MongoConfigError extends Error {
  public readonly code = "MONGO_NOT_CONFIGURED" as const;

  constructor() {
    super("Database is not configured.");
    this.name = "MongoConfigError";
  }
}

export function toPublicApiError(
  err: unknown,
  opts?: { fallbackMessage?: string; fallbackStatus?: number },
): { status: number; body: { ok: false; error: string; code?: string } } {
  if (err instanceof MongoConfigError) {
    return {
      status: 503,
      body: {
        ok: false,
        code: err.code,
        error: "Service temporarily unavailable. Please try again later.",
      },
    };
  }

  // In dev, surface the real error to speed up debugging.
  if (process.env.NODE_ENV !== "production") {
    const message = err instanceof Error ? err.message : String(err);
    return { status: 500, body: { ok: false, error: message } };
  }

  return {
    status: opts?.fallbackStatus ?? 500,
    body: {
      ok: false,
      error: opts?.fallbackMessage ?? "Unexpected server error.",
    },
  };
}

