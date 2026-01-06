"use client";

export type AuthRole = "user" | "admin";

const AUTH_COOKIE = "sig_auth";
const ROLE_COOKIE = "sig_role";
const EMAIL_COOKIE = "sig_email";

function assertClient() {
  if (typeof window === "undefined") {
    throw new Error("authClient can only be used in the browser.");
  }
}

export function getCookie(name: string) {
  assertClient();
  const prefix = `${encodeURIComponent(name)}=`;
  const parts = document.cookie.split(";").map((p) => p.trim());
  const match = parts.find((p) => p.startsWith(prefix));
  if (!match) return null;
  return decodeURIComponent(match.slice(prefix.length));
}

export function setAuthCookies(params: { role: AuthRole; email: string }) {
  assertClient();
  const maxAgeSeconds = 60 * 60 * 24 * 7; // 7 days
  document.cookie = `${AUTH_COOKIE}=1; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE}=${encodeURIComponent(params.role)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
  document.cookie = `${EMAIL_COOKIE}=${encodeURIComponent(params.email)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

export function clearAuthCookies() {
  assertClient();
  const expires = "Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = `${AUTH_COOKIE}=; Path=/; Expires=${expires}; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE}=; Path=/; Expires=${expires}; SameSite=Lax`;
  document.cookie = `${EMAIL_COOKIE}=; Path=/; Expires=${expires}; SameSite=Lax`;
}

export function getAuthSnapshot() {
  assertClient();
  const isAuthed = getCookie(AUTH_COOKIE) === "1";
  const role = (getCookie(ROLE_COOKIE) ?? "user") as AuthRole;
  const email = getCookie(EMAIL_COOKIE) ?? "";
  return { isAuthed, role, email };
}

