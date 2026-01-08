"use client";

function assertClient() {
  if (typeof window === "undefined") {
    throw new Error("userStore can only be used in the browser.");
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function signUp(params: {
  email: string;
  password: string;
  confirmPassword: string;
}) {
  assertClient();
  const email = normalizeEmail(params.email);
  const password = params.password;

  if (!email || !email.includes("@")) {
    return { ok: false as const, error: "Please enter a valid email." };
  }
  if (password.length < 6) {
    return { ok: false as const, error: "Password must be at least 6 characters." };
  }
  if (params.confirmPassword !== password) {
    return { ok: false as const, error: "Passwords do not match." };
  }

  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      confirmPassword: params.confirmPassword,
    }),
  });

  const json = (await res.json().catch(() => null)) as
    | { ok: true }
    | { ok: false; error: string }
    | null;

  if (!res.ok || !json || json.ok !== true) {
    const message =
      json && "error" in json && typeof json.error === "string"
        ? json.error
        : "Sign up failed. Please try again.";
    return { ok: false as const, error: message };
  }

  return { ok: true as const };
}

export async function logIn(params: {
  email: string;
  password: string;
  asAdmin?: boolean;
  adminKey?: string;
}) {
  assertClient();
  const email = normalizeEmail(params.email);
  const password = params.password;

  if (!email || !email.includes("@")) {
    return { ok: false as const, error: "Please enter a valid email." };
  }
  if (!password) {
    return { ok: false as const, error: "Please enter your password." };
  }

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      asAdmin: Boolean(params.asAdmin),
      adminKey: params.adminKey ?? "",
    }),
  });

  const json = (await res.json().catch(() => null)) as
    | { ok: true; role?: "user" | "admin" }
    | { ok: false; error: string }
    | null;

  if (!res.ok || !json || json.ok !== true) {
    const message =
      json && "error" in json && typeof json.error === "string"
        ? json.error
        : "Login failed. Please try again.";
    return { ok: false as const, error: message };
  }

  return { ok: true as const };
}

