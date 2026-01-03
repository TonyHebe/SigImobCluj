import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const CONTACT_RECIPIENT =
  process.env.CONTACT_RECIPIENT ?? "jessica_pana24@yahoo.com";

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

    const transporter = makeTransport();

    const from =
      getEnv("SMTP_FROM") ??
      (getEnv("SMTP_USER")
        ? `Sig Imobiliare Cluj <${getEnv("SMTP_USER")}>`
        : "Sig Imobiliare Cluj <no-reply@localhost>");

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

    const info = await transporter.sendMail({
      to: CONTACT_RECIPIENT,
      from,
      replyTo: email,
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

    const message = err instanceof Error ? err.message : "Failed to send message.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

