"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export type QuickSearchFilters = {
  propertyType: string;
  neighborhood: string;
  budget: string;
  id: string;
};

const RESET_FILTERS: QuickSearchFilters = {
  propertyType: "Oricare",
  neighborhood: "Oricare",
  budget: "",
  id: "",
};

export function QuickRequestForm({
  action = "/listari",
  variant = "stacked",
  defaultValues,
}: {
  action?: string;
  variant?: "stacked" | "bar";
  defaultValues?: Partial<QuickSearchFilters>;
}) {
  const router = useRouter();

  const initial = useMemo<QuickSearchFilters>(
    () => ({
      propertyType: defaultValues?.propertyType ?? "Apartament",
      neighborhood: defaultValues?.neighborhood ?? "Oricare",
      budget: defaultValues?.budget ?? "",
      id: defaultValues?.id ?? "",
    }),
    [defaultValues?.budget, defaultValues?.id, defaultValues?.neighborhood, defaultValues?.propertyType],
  );

  const [propertyType, setPropertyType] = useState(initial.propertyType);
  const [neighborhood, setNeighborhood] = useState(initial.neighborhood);
  const [budget, setBudget] = useState(initial.budget);
  const [id, setId] = useState(initial.id);

  const handleReset = () => {
    setPropertyType(RESET_FILTERS.propertyType);
    setNeighborhood(RESET_FILTERS.neighborhood);
    setBudget(RESET_FILTERS.budget);
    setId(RESET_FILTERS.id);

    const isAlreadyClean =
      typeof window === "undefined"
        ? false
        : window.location.pathname === action && !window.location.search;
    if (isAlreadyClean) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      router.refresh();
      return;
    }

    router.push(action);
  };

  return (
    <form
      className={
        variant === "bar"
          ? "mt-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-end"
          : "mt-5 grid gap-3"
      }
      action={action}
      method="GET"
    >
      <div
        className={
          variant === "bar"
            ? "grid w-full gap-3 md:grid-cols-4"
            : "grid gap-3 sm:grid-cols-2"
        }
      >
        <label className="grid gap-1 text-sm">
          <span className="text-slate-700">Tip proprietate</span>
          <select
            name="propertyType"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option>Oricare</option>
            <option>Apartament</option>
            <option>Casă</option>
            <option>Teren</option>
            <option>Spațiu comercial</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-slate-700">Cartier</span>
          <select
            name="neighborhood"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option>Oricare</option>
            <option>Zorilor</option>
            <option>Gheorgheni</option>
            <option>Mărăști</option>
            <option>Grigorescu</option>
            <option>Centru</option>
            <option>Făget</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-slate-700">Buget</span>
          <select
            name="budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="">Oricare</option>
            <option value="0–30.000 €">0–30.000 €</option>
            <option value="30.000–80.000 €">30.000–80.000 €</option>
            <option value="80.000–120.000 €">80.000–120.000 €</option>
            <option value="120.000–180.000 €">120.000–180.000 €</option>
            <option value="180.000–250.000 €">180.000–250.000 €</option>
            <option value="250.000+ €">250.000+ €</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-slate-700">ID</span>
          <input
            name="id"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Ex: apt-zorilor-3cam"
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </label>
      </div>

      <div
        className={
          variant === "bar"
            ? "flex items-center gap-2 md:shrink-0"
            : "mt-1 flex items-center gap-2"
        }
      >
        <button
          type="button"
          onClick={handleReset}
          aria-label="Resetează filtrele"
          title="Resetează"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="mr-2 size-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v6h-6" />
          </svg>
          Refresh
        </button>

        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          Cauta
        </button>
      </div>
    </form>
  );
}

