"use client";

type StoredUser = {
  email: string;
  passwordHash: string;
  createdAt: string;
};

type UserStore = Record<string, StoredUser>;

const STORAGE_KEY = "sig_users_v1";

function assertClient() {
  if (typeof window === "undefined") {
    throw new Error("userStore can only be used in the browser.");
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function bufferToHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(text: string) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(digest);
}

function readStore(): UserStore {
  assertClient();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as UserStore;
  } catch {
    return {};
  }
}

function writeStore(store: UserStore) {
  assertClient();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
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

  const store = readStore();
  if (store[email]) {
    return { ok: false as const, error: "Account already exists. Please log in." };
  }

  const passwordHash = await sha256Hex(password);
  store[email] = { email, passwordHash, createdAt: new Date().toISOString() };
  writeStore(store);

  return { ok: true as const };
}

export async function logIn(params: { email: string; password: string }) {
  assertClient();
  const email = normalizeEmail(params.email);
  const password = params.password;

  if (!email || !email.includes("@")) {
    return { ok: false as const, error: "Please enter a valid email." };
  }
  if (!password) {
    return { ok: false as const, error: "Please enter your password." };
  }

  const store = readStore();
  const user = store[email];
  if (!user) {
    return { ok: false as const, error: "No account found. Please sign up first." };
  }

  const passwordHash = await sha256Hex(password);
  if (passwordHash !== user.passwordHash) {
    return { ok: false as const, error: "Incorrect email or password." };
  }

  return { ok: true as const };
}

