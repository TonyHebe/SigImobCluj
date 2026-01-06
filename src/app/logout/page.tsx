"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { clearAuthCookies } from "@/lib/authClient";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    clearAuthCookies();
    router.replace("/login");
    router.refresh();
  }, [router]);

  return (
    <div className="min-h-dvh bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-14 text-sm text-slate-600 sm:px-6">
        Logging out…
      </div>
    </div>
  );
}

