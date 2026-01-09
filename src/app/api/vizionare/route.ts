import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "node:crypto";

export const runtime = "nodejs";

function isEmailLike(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

function getEnv(name: string): string | undefined {
  const v = process.env[name];
  if (!v) return undefined;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : undefined;
}

const CONTACT_RECIPIENT_RAW =
  getEnv("CONTACT_RECIPIENT") ?? "jessicapana9@gmail.com";
const CONTACT_RECIPIENT = isEmailLike(CONTACT_RECIPIENT_RAW)
  ? CONTACT_RECIPIENT_RAW
  : "jessicapana9@gmail.com";

class SmtpConfigError extends Error {
  public readonly code = "SMTP_NOT_CONFIGURED" as const;
  constructor() {
    super("SMTP is not configured.");
  }
}

function toProdSafeMessage(
  err: unknown,
  fallback: string,
): { status: number; body: { ok: false; error: string } } {
  if (process.env.NODE_ENV !== "production") {
    const message = err instanceof Error ? err.message : String(err);
    return { status: 500, body: { ok: false, error: message } };
  }
  return { status: 500, body: { ok: false, error: fallback } };
}

function clamp(input: unknown, maxLen: number): string | undefined {
  if (typeof input !== "string") return undefined;
  const s = input.trim();
  if (!s) return undefined;
  return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
}

function redactEmail(addr: string | undefined): string | undefined {
  if (!addr) return undefined;
  const at = addr.indexOf("@");
  if (at <= 1) return "***";
  return `${addr[0]}***${addr.slice(at)}`;
}

function serializeMailError(err: unknown) {
  if (!(err instanceof Error)) return { message: String(err) };
  const anyErr = err as Error & Record<string, unknown>;
  return {
    name: err.name,
    message: err.message,
    code: typeof anyErr.code === "string" ? anyErr.code : undefined,
    command: typeof anyErr.command === "string" ? anyErr.command : undefined,
    response: typeof anyErr.response === "string" ? anyErr.response : undefined,
    responseCode:
      typeof anyErr.responseCode === "number" ? anyErr.responseCode : undefined,
    errno: typeof anyErr.errno === "number" ? anyErr.errno : undefined,
    syscall: typeof anyErr.syscall === "string" ? anyErr.syscall : undefined,
    address: typeof anyErr.address === "string" ? anyErr.address : undefined,
    port: typeof anyErr.port === "number" ? anyErr.port : undefined,
    stack: typeof err.stack === "string" ? err.stack : undefined,
  };
}

type TransportBundle =
  | {
      kind: "smtp";
      transporter: nodemailer.Transporter;
      meta: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
      };
    }
  | {
      kind: "stream";
      transporter: nodemailer.Transporter;
      meta: { note: "dev stream transport (SMTP not configured)" };
    };

function makeTransport(): TransportBundle {
  const host = getEnv("SMTP_HOST");
  const user = getEnv("SMTP_USER");
  const pass = getEnv("SMTP_PASS");
  const portRaw = getEnv("SMTP_PORT");

  if (!host || !user || !pass) {
    if (process.env.NODE_ENV !== "production") {
      return {
        kind: "stream",
        transporter: nodemailer.createTransport({
          streamTransport: true,
          newline: "unix",
          buffer: true,
        }),
        meta: { note: "dev stream transport (SMTP not configured)" },
      };
    }
    throw new SmtpConfigError();
  }

  const port = portRaw ? Number(portRaw) : 465;
  const secure = port === 465;

  return {
    kind: "smtp",
    transporter: nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    }),
    meta: { host, port, secure, user },
  };
}

type ViewingPayload = {
  name?: string;
  phone?: string;
  email?: string;
  propertyType?: string;
  timeSlot?: string;
  details?: string;
  source?: string;
};

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const body = (await req.json()) as ViewingPayload;

    const name = clamp(body.name, 120);
    const phone = clamp(body.phone, 50);
    const email = clamp(body.email, 200);
    const propertyType = clamp(body.propertyType, 80);
    const timeSlot = clamp(body.timeSlot, 80);
    const details = clamp(body.details, 4000);
    const source = clamp(body.source, 80) ?? "viewing-appointment";

    const hasContact = Boolean(phone) || Boolean(email);
    if (!name || !hasContact || !timeSlot || !details) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Completează numele, un contact (telefon sau email), intervalul orar și detaliile.",
        },
        { status: 400 },
      );
    }

    const transport = makeTransport();

    const smtpUser = getEnv("SMTP_USER");
    const from = getEnv("SMTP_FROM") ?? (smtpUser ? smtpUser : "no-reply@localhost");
    const replyTo = email && isEmailLike(email) ? email : undefined;

    const subject = "[Sig Imobiliare Cluj] Programare vizionare";

    const lines: string[] = [
      "Ai primit o cerere nouă pentru programare vizionare.",
      "",
      `Source: ${source}`,
      `Nume: ${name}`,
      phone ? `Telefon: ${phone}` : undefined,
      email ? `Email: ${email}` : undefined,
      propertyType ? `Tip proprietate: ${propertyType}` : undefined,
      `Interval orar: ${timeSlot}`,
      "",
      "Detalii:",
      details,
      "",
    ].filter(Boolean) as string[];

    if (transport.kind === "smtp") {
      console.log("[vizionare] smtp configured", {
        requestId,
        host: transport.meta.host,
        port: transport.meta.port,
        secure: transport.meta.secure,
        user: redactEmail(transport.meta.user),
        from: redactEmail(from),
        to: redactEmail(CONTACT_RECIPIENT),
        replyTo: redactEmail(replyTo),
      });
      try {
        await transport.transporter.verify();
        console.log("[vizionare] smtp verify ok", { requestId });
      } catch (verifyErr) {
        console.error("[vizionare] smtp verify failed", {
          requestId,
          error: serializeMailError(verifyErr),
        });
      }
    } else {
      console.log("[vizionare] smtp not configured; using dev transport", {
        requestId,
      });
    }

    const info = await transport.transporter.sendMail({
      to: CONTACT_RECIPIENT,
      from,
      replyTo,
      subject,
      text: lines.join("\n"),
    });

    if (process.env.NODE_ENV !== "production") {
      const maybeMessage = (info as { message?: Buffer | string }).message;
      if (maybeMessage) {
        const text =
          typeof maybeMessage === "string"
            ? maybeMessage
            : maybeMessage.toString("utf8");
        console.log("[vizionare] email (dev transport):\n" + text);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof SmtpConfigError) {
      console.error("[vizionare] smtp not configured", { requestId });
      return NextResponse.json(
        {
          ok: false,
          code: err.code,
          error:
            "Momentan formularul nu poate trimite emailuri automat. Te rugăm să ne scrii direct:",
          contactEmail: CONTACT_RECIPIENT,
        },
        { status: 503 },
      );
    }

    console.error("[vizionare] email send failed", {
      requestId,
      error: serializeMailError(err),
    });
    const safe = toProdSafeMessage(err, "Failed to send appointment request.");
    return NextResponse.json(safe.body, { status: safe.status });
  }
}

