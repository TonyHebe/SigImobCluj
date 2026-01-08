"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { logIn, signUp } from "@/lib/userStore";

type Mode = "login" | "signup";

export function LoginPageClient({ nextPath }: { nextPath: string }) {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [asAdmin, setAsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");

  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsBusy(true);

    try {
      if (mode === "signup") {
        const res = await signUp({ email, password, confirmPassword });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        router.replace(nextPath || "/");
        router.refresh();
        return;
      }

      // Login
      if (asAdmin) {
        if (!adminKey) {
          setError("Please enter the admin key.");
          return;
        }
        const res = await logIn({ email, password, asAdmin: true, adminKey });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        router.replace(nextPath || "/");
        router.refresh();
        return;
      } else {
        const res = await logIn({ email, password });
        if (!res.ok) {
          setError(res.error);
          return;
        }
        router.replace(nextPath || "/");
        router.refresh();
        return;
      }
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div className="hidden lg:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            <span className="inline-flex size-2 rounded-full bg-emerald-500" />
            Secure access
          </div>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-slate-900">
            Sign in to enter the website.
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-slate-600">
            Log in with email & password, or create a new account. Admin access
            is available if you have the admin key.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={[
                "flex-1 rounded-xl px-4 py-2 text-sm font-semibold",
                mode === "login"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setAsAdmin(false);
                setAdminKey("");
                setError(null);
              }}
              className={[
                "flex-1 rounded-xl px-4 py-2 text-sm font-semibold",
                mode === "signup"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-900">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                autoComplete="email"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none ring-sky-500/30 focus:border-sky-300 focus:ring-4"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900">
                Password
              </label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none ring-sky-500/30 focus:border-sky-300 focus:ring-4"
                placeholder="••••••••"
                required
              />
              <div className="mt-2 text-xs text-slate-500">
                Minimum 6 characters.
              </div>
            </div>

            {mode === "signup" ? (
              <div>
                <label className="text-sm font-semibold text-slate-900">
                  Confirm password
                </label>
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none ring-sky-500/30 focus:border-sky-300 focus:ring-4"
                  placeholder="••••••••"
                  required
                />
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-slate-300 text-sky-600"
                    checked={asAdmin}
                    onChange={(e) => {
                      setAsAdmin(e.target.checked);
                      setError(null);
                    }}
                  />
                  Log in as admin
                </label>
                <div className="text-xs text-slate-500">
                  Needs admin key
                </div>
              </div>
            )}

            {mode === "login" && asAdmin ? (
              <div>
                <label className="text-sm font-semibold text-slate-900">
                  Admin key
                </label>
                <input
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  type="password"
                  autoComplete="off"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none ring-sky-500/30 focus:border-sky-300 focus:ring-4"
                  placeholder="Enter admin key"
                  required
                />
              </div>
            ) : null}

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isBusy}
              className="mt-2 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isBusy
                ? "Please wait…"
                : mode === "signup"
                  ? "Create account"
                  : asAdmin
                    ? "Log in as admin"
                    : "Log in"}
            </button>

            <div className="text-center text-xs text-slate-500">
              After you log in, you’ll be redirected to{" "}
              <span className="font-semibold text-slate-700">{nextPath}</span>.
            </div>
          </form>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600">
            <div className="font-semibold text-slate-900">Admin setup</div>
            <div className="mt-1">
              Set <span className="font-semibold">ADMIN_KEY</span> (recommended) or{" "}
              <span className="font-semibold">NEXT_PUBLIC_ADMIN_KEY</span> in your
              environment to change the admin key (default is{" "}
              <span className="font-semibold">123456</span>).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

