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
    throw new Error(
      "Missing SMTP config. Please set SMTP_HOST, SMTP_USER, SMTP_PASS (and optionally SMTP_PORT).",
    );
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
      (getEnv("SMTP_USER") ? `Sig Imobiliare Cluj <${getEnv("SMTP_USER")}>` : "Sig Imobiliare Cluj");

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

    await transporter.sendMail({
      to: CONTACT_RECIPIENT,
      from,
      replyTo: email,
      subject,
      text: lines.join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to send message.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

