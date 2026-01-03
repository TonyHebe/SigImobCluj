import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import crypto from "node:crypto";

export const runtime = "nodejs";

function isEmailLike(input: string): boolean {
  // Pragmatic (not RFC-complete) validation to avoid passing invalid
  // addresses to SMTP providers, which can yield confusing 5xx errors.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

const CONTACT_RECIPIENT_RAW =
  getEnv("CONTACT_RECIPIENT") ?? "jessica_pana24@yahoo.com";
const CONTACT_RECIPIENT = isEmailLike(CONTACT_RECIPIENT_RAW)
  ? CONTACT_RECIPIENT_RAW
  : "jessica_pana24@yahoo.com";

type ContactPayload = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  propertyType?: string;
  neighborhood?: string;
  budget?: string;
  source?: string;
};

class SmtpConfigError extends Error {
  public readonly code = "SMTP_NOT_CONFIGURED" as const;
  constructor() {
    super("SMTP is not configured.");
  }
}

function getEnv(name: string): string | undefined {
  const v = process.env[name];
  if (!v) return undefined;
  const trimmed = v.trim();
  return trimmed.length ? trimmed : undefined;
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
    // In local/dev environments we allow submitting the form without SMTP
    // by writing the generated email to the server logs (stream transport).
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

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  try {
    const body = (await req.json()) as ContactPayload;

    const name = clamp(body.name, 120);
    const email = clamp(body.email, 200);
    const phone = clamp(body.phone, 50);
    const message = clamp(body.message, 4000);
    const propertyType = clamp(body.propertyType, 80);
    const neighborhood = clamp(body.neighborhood, 120);
    const budget = clamp(body.budget, 80);
    const source = clamp(body.source, 80) ?? "website";

    // Require at least a message OR a lead request (phone + some details).
    const hasMessage = Boolean(message);
    const hasLeadRequest = Boolean(phone || email) && Boolean(propertyType || neighborhood || budget);
    if (!hasMessage && !hasLeadRequest) {
      return NextResponse.json(
        { ok: false, error: "Missing message/details." },
        { status: 400 },
      );
    }

    const transport = makeTransport();

    const smtpUser = getEnv("SMTP_USER");
    const from =
      getEnv("SMTP_FROM") ??
      (smtpUser ? smtpUser : "no-reply@localhost");

    const subject = `[Sig Imobiliare Cluj] Mesaj nou (${source})`;

    const lines: string[] = [
      "Ai primit un mesaj nou de pe site.",
      "",
      `Source: ${source}`,
      name ? `Nume: ${name}` : undefined,
      email ? `Email: ${email}` : undefined,
      phone ? `Telefon: ${phone}` : undefined,
      propertyType ? `Tip proprietate: ${propertyType}` : undefined,
      neighborhood ? `Cartier: ${neighborhood}` : undefined,
      budget ? `Buget: ${budget}` : undefined,
      "",
      "Mesaj:",
      message ?? "(fără mesaj)",
      "",
    ].filter(Boolean) as string[];

    const replyTo = email && isEmailLike(email) ? email : undefined;

    // Helpful diagnostics for provider-specific SMTP failures (like Yahoo 550s).
    // Safe: do NOT log SMTP_PASS or email body.
    if (transport.kind === "smtp") {
      console.log("[contact] smtp configured", {
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
        console.log("[contact] smtp verify ok", { requestId });
      } catch (verifyErr) {
        console.error("[contact] smtp verify failed", {
          requestId,
          error: serializeMailError(verifyErr),
        });
      }
    } else {
      console.log("[contact] smtp not configured; using dev transport", {
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

    // If we're using the dev stream transport, print the message so it can be inspected.
    // (In production we send via SMTP and do not log message bodies.)
    if (process.env.NODE_ENV !== "production") {
      const maybeMessage = (info as { message?: Buffer | string }).message;
      if (maybeMessage) {
        const text =
          typeof maybeMessage === "string"
            ? maybeMessage
            : maybeMessage.toString("utf8");
        console.log("[contact] email (dev transport):\n" + text);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof SmtpConfigError) {
      console.error("[contact] smtp not configured", { requestId });
      return NextResponse.json(
        {
          ok: false,
          code: err.code,
          error:
            "Formularul de contact nu este configurat pe server (SMTP lipsește).",
          contactEmail: CONTACT_RECIPIENT,
        },
        { status: 503 },
      );
    }

    console.error("[contact] email send failed", {
      requestId,
      error: serializeMailError(err),
    });
    const message = err instanceof Error ? err.message : "Failed to send message.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

