"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearAuthCookies, getAuthSnapshot } from "@/lib/authClient";

function formatRole(role: string) {
  if (role === "admin") return "Admin";
  return "User";
}

export function AuthTopBar() {
  const router = useRouter();
  const pathname = usePathname();

  const auth = (() => {
    try {
      return getAuthSnapshot();
    } catch {
      return { isAuthed: false, role: "user" as const, email: "" };
    }
  })();

  if (!auth.isAuthed) return null;
  if (pathname?.startsWith("/login")) return null;

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2 text-sm sm:px-6">
        <div className="flex items-center gap-3 text-slate-600">
          <div>
            Logged in as{" "}
            <span className="font-semibold text-slate-900">
              {formatRole(auth.role)}
            </span>
            {auth.email ? (
              <>
                {" "}
                • <span className="text-slate-700">{auth.email}</span>
              </>
            ) : null}
          </div>
          {auth.role === "admin" ? (
            <Link
              href="/admin/oferte"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Admin: Oferte
            </Link>
          ) : null}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
          onClick={() => {
            clearAuthCookies();
            router.replace("/login");
            router.refresh();
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}

