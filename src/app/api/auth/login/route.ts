import { NextResponse } from "next/server";

import { verifyPassword } from "@/lib/password";
import { getUserByEmail } from "@/lib/usersDb";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getAdminKeyExpected() {
  // Prefer a server-only env var, but keep compatibility if you already set NEXT_PUBLIC_ADMIN_KEY.
  return process.env.ADMIN_KEY || process.env.NEXT_PUBLIC_ADMIN_KEY || "123456";
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
      asAdmin: boolean;
      adminKey: string;
    }>;

    const email = normalizeEmail(data.email ?? "");
    const password = data.password ?? "";
    const asAdmin = Boolean(data.asAdmin);
    const adminKey = data.adminKey ?? "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email." },
        { status: 400 },
      );
    }
    if (!password) {
      return NextResponse.json(
        { ok: false, error: "Please enter your password." },
        { status: 400 },
      );
    }

    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "No account found. Please sign up first." },
        { status: 404 },
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "Incorrect email or password." },
        { status: 401 },
      );
    }

    let role: "user" | "admin" = "user";
    if (asAdmin) {
      const expected = getAdminKeyExpected();
      if (!adminKey) {
        return NextResponse.json(
          { ok: false, error: "Please enter the admin key." },
          { status: 400 },
        );
      }
      if (adminKey !== expected) {
        return NextResponse.json(
          { ok: false, error: "Invalid admin key." },
          { status: 403 },
        );
      }
      role = "admin";
    }

    const res = NextResponse.json({ ok: true, role });
    setAuthCookies(res, { role, email });
    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}

