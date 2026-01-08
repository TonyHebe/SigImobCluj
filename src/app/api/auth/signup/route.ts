import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/password";
import { createUser } from "@/lib/usersDb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function setAuthCookies(
  res: NextResponse,
  params: { role: "user" | "admin"; email: string },
) {
  const maxAgeSeconds = 60 * 60 * 24 * 7; // 7 days
  const secure = process.env.NODE_ENV === "production";

  res.cookies.set("sig_auth", "1", {
    path: "/",
    maxAge: maxAgeSeconds,
    sameSite: "lax",
    secure,
  });
  res.cookies.set("sig_role", params.role, {
    path: "/",
    maxAge: maxAgeSeconds,
    sameSite: "lax",
    secure,
  });
  res.cookies.set("sig_email", params.email, {
    path: "/",
    maxAge: maxAgeSeconds,
    sameSite: "lax",
    secure,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as unknown;
    const data = body as Partial<{
      email: string;
      password: string;
      confirmPassword: string;
    }>;

    const email = normalizeEmail(data.email ?? "");
    const password = data.password ?? "";
    const confirmPassword = data.confirmPassword ?? "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email." },
        { status: 400 },
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { ok: false, error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }
    if (confirmPassword !== password) {
      return NextResponse.json(
        { ok: false, error: "Passwords do not match." },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(password);
    const created = await createUser({ email, passwordHash });
    if (created === "exists") {
      return NextResponse.json(
        { ok: false, error: "Account already exists. Please log in." },
        { status: 409 },
      );
    }

    const res = NextResponse.json({ ok: true });
    setAuthCookies(res, { role: "user", email });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

