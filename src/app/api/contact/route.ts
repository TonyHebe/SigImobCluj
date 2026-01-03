import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

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

class EmailProviderConfigError extends Error {
  public readonly code = "EMAIL_PROVIDER_NOT_CONFIGURED" as const;
  constructor() {
    super("Email provider is not configured.");
  }
}

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

function safeString(input: unknown, maxLen = 500): string | undefined {
  if (typeof input !== "string") return undefined;
  const s = input.trim();
  if (!s) return undefined;
  return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
}

function logEmailError(
  provider: "smtp" | "resend",
  err: unknown,
  meta: Record<string, unknown>,
) {
  const e = err as Partial<{
    message: string;
    code: string;
    name: string;
    command: string;
    response: string;
    responseCode: number;
    stack: string;
  }>;

  console.error("[contact] email send failed", {
    provider,
    ...meta,
    errName: e.name,
    errCode: e.code,
    errMessage: safeString(e.message, 800),
    smtpCommand: safeString(e.command),
    smtpResponseCode: e.responseCode,
    smtpResponse: safeString(e.response, 800),
  });
}

async function sendViaResend(args: {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  text: string;
}) {
  const apiKey = getEnv("RESEND_API_KEY");
  if (!apiKey) throw new EmailProviderConfigError();

  const from = getEnv("RESEND_FROM") ?? args.from;
  // Resend requires a verified sender; avoid silently attempting with no-reply.
  if (!from || from === "no-reply@localhost") {
    throw new EmailProviderConfigError();
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [args.to],
      subject: args.subject,
      text: args.text,
      reply_to: args.replyTo,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Resend failed (${res.status}): ${body || res.statusText || "Unknown error"}`,
    );
  }
}

function clamp(input: unknown, maxLen: number): string | undefined {
  if (typeof input !== "string") return undefined;
  const s = input.trim();
  if (!s) return undefined;
  return s.length > maxLen ? `${s.slice(0, maxLen)}…` : s;
}

function makeTransport() {
  const host = getEnv("SMTP_HOST");
  const user = getEnv("SMTP_USER");
  const pass = getEnv("SMTP_PASS");
  const portRaw = getEnv("SMTP_PORT");

  if (!host || !user || !pass) {
    // In local/dev environments we allow submitting the form without SMTP
    // by writing the generated email to the server logs (stream transport).
    if (process.env.NODE_ENV !== "production") {
      return nodemailer.createTransport({
        streamTransport: true,
        newline: "unix",
        buffer: true,
      });
    }
    throw new SmtpConfigError();
  }

  const port = portRaw ? Number(portRaw) : 465;
  const secure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export async function POST(req: NextRequest) {
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
    const text = lines.join("\n");

    // Prefer Resend (API) if configured; fall back to SMTP.
    if (getEnv("RESEND_API_KEY")) {
      try {
        await sendViaResend({
          to: CONTACT_RECIPIENT,
          from,
          replyTo,
          subject,
          text,
        });
      } catch (err) {
        logEmailError("resend", err, {
          to: CONTACT_RECIPIENT,
          from,
          replyTo,
          source,
        });
        throw err;
      }
    } else {
      const transporter = makeTransport();
      // Verify SMTP connection/auth to surface clearer errors in logs.
      try {
        await transporter.verify();
      } catch (err) {
        logEmailError("smtp", err, {
          step: "verify",
          host: getEnv("SMTP_HOST"),
          port: getEnv("SMTP_PORT") ?? 465,
          user: getEnv("SMTP_USER"),
          to: CONTACT_RECIPIENT,
          from,
          replyTo,
          source,
        });
        throw err;
      }

      let info: unknown;
      try {
        info = await transporter.sendMail({
          to: CONTACT_RECIPIENT,
          from,
          replyTo,
          subject,
          text,
        });
      } catch (err) {
        logEmailError("smtp", err, {
          step: "sendMail",
          host: getEnv("SMTP_HOST"),
          port: getEnv("SMTP_PORT") ?? 465,
          user: getEnv("SMTP_USER"),
          to: CONTACT_RECIPIENT,
          from,
          replyTo,
          source,
        });
        throw err;
      }

      // If we're using the dev stream transport, print the message so it can be inspected.
      // (In production we send via SMTP and do not log message bodies.)
      if (process.env.NODE_ENV !== "production") {
        const maybeMessage = (info as { message?: Buffer | string }).message;
        if (maybeMessage) {
          const printed =
            typeof maybeMessage === "string"
              ? maybeMessage
              : maybeMessage.toString("utf8");
          console.log("[contact] email (dev transport):\n" + printed);
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof EmailProviderConfigError) {
      return NextResponse.json(
        {
          ok: false,
          code: err.code,
          error:
            "Formularul de contact nu este configurat pe server (provider email lipsește).",
          contactEmail: CONTACT_RECIPIENT,
        },
        { status: 503 },
      );
    }
    if (err instanceof SmtpConfigError) {
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

    const message =
      err instanceof Error ? err.message : "Failed to send message.";
    const responseCode =
      typeof (err as { responseCode?: unknown }).responseCode === "number"
        ? ((err as { responseCode?: number }).responseCode as number)
        : undefined;
    return NextResponse.json(
      {
        ok: false,
        error: message,
        smtpResponseCode: responseCode,
      },
      { status: 500 },
    );
  }
}

