export type QuickSearchFilters = {
  propertyType: string;
  neighborhood: string;
  budget: string;
  id: string;
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
  const propertyType = defaultValues?.propertyType ?? "Apartament";
  const neighborhood = defaultValues?.neighborhood ?? "Oricare";
  const budget = defaultValues?.budget ?? "";
  const id = defaultValues?.id ?? "";

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
            defaultValue={propertyType}
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
            defaultValue={neighborhood}
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
            defaultValue={budget}
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
            defaultValue={id}
            placeholder="Ex: apt-zorilor-3cam"
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
        </label>
      </div>

      <button
        type="submit"
        className={
          variant === "bar"
            ? "inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 md:shrink-0"
            : "mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        }
      >
        Cauta
      </button>
    </form>
  );
}

