import { Suspense } from "react";

import { AdminOferteClient } from "@/app/admin/oferte/AdminOferteClient";

export default function AdminOfertePage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
            Loading…
          </div>
        </div>
      }
    >
      <AdminOferteClient />
    </Suspense>
  );
}

