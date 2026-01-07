import Image from "next/image";
import Link from "next/link";

import { HomeLinkScrollTop } from "@/components/HomeLinkScrollTop";
import { QuickRequestForm } from "@/components/QuickRequestForm";
import { ScrollTopLink } from "@/components/ScrollTopLink";
import { featuredListings } from "@/lib/listings";

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function listingNeighborhoodFromTitle(title: string) {
  const parts = title.split("•").map((p) => p.trim()).filter(Boolean);
  return parts.length >= 2 ? parts[parts.length - 1] : null;
}

function parseEuroAmount(value: string) {
  const digits = value.replace(/[^\d]/g, "");
  const amount = Number(digits);
  return Number.isFinite(amount) ? amount : null;
}

function parseBudgetRange(budget: string): { min: number; max: number } | null {
  const b = budget.trim();
  if (!b) return null;
  if (b.includes("+")) {
    const min = parseEuroAmount(b);
    return min == null ? null : { min, max: Number.POSITIVE_INFINITY };
  }
  const [left, right] = b.split("–").map((x) => x.trim());
  if (!left || !right) return null;
  const min = parseEuroAmount(left);
  const max = parseEuroAmount(right);
  if (min == null || max == null) return null;
  return { min, max };
}

function kindFromPropertyType(propertyType: string) {
  switch (normalizeText(propertyType)) {
    case "apartament":
      return "apartment";
    case "casa":
      return "house";
    case "teren":
      return "land";
    default:
      return null;
  }
}

function ListingCard({
  listing,
}: {
  listing: (typeof featuredListings)[number];
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        <div className="relative h-44 overflow-hidden bg-[linear-gradient(135deg,rgba(14,165,233,0.22),rgba(99,102,241,0.18))]">
          <Image
            src={listing.images[0].src}
            alt={listing.images[0].alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-300 ease-out group-hover:scale-105"
            priority={listing.id === "apt-zorilor-3cam"}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/30 via-slate-950/10 to-transparent"
          />
        </div>
        <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
          {listing.badge}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              <Link
                href={`/oferte/${listing.id}`}
                className="outline-none hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-sky-200"
              >
                {listing.title}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-slate-600">{listing.subtitle}</p>
          </div>
          <div className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
            {listing.price}
          </div>
        </div>

        <ul className="mt-4 flex flex-wrap gap-2">
          {listing.details.map((d) => (
            <li
              key={d}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
            >
              {d}
            </li>
          ))}
        </ul>

        <div className="mt-5 flex items-center justify-between">
          <Link
            href={`/oferte/${listing.id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-800"
          >
            Vezi detalii
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14" />
              <path d="m13 5 7 7-7 7" />
            </svg>
          </Link>
          <span className="text-xs text-slate-500">ID: {listing.id}</span>
        </div>
      </div>
    </article>
  );
}

type SearchParams = Record<string, string | string[] | undefined>;

function getSearchParam(sp: SearchParams | undefined, key: string) {
  const v = sp?.[key];
  return Array.isArray(v) ? v[0] : v;
}

function hasActiveFilters(filters: {
  propertyType: string;
  neighborhood: string;
  budget: string;
  id: string;
}) {
  const propertyTypeActive = normalizeText(filters.propertyType) !== normalizeText("Oricare");
  const neighborhoodActive = normalizeText(filters.neighborhood) !== normalizeText("Oricare");
  const budgetActive = !!filters.budget.trim();
  const idActive = !!filters.id.trim();
  return propertyTypeActive || neighborhoodActive || budgetActive || idActive;
}

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

export default async function ListariPage({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? undefined;
  const filters = {
    propertyType:
      getSearchParam(resolvedSearchParams, "propertyType") ?? "Oricare",
    neighborhood:
      getSearchParam(resolvedSearchParams, "neighborhood") ?? "Oricare",
    budget: getSearchParam(resolvedSearchParams, "budget") ?? "",
    id: getSearchParam(resolvedSearchParams, "id") ?? "",
  };

  const active = hasActiveFilters(filters);

  const filtered = active
    ? featuredListings.filter((listing) => {
        const kind = kindFromPropertyType(filters.propertyType);
        if (kind && listing.kind !== kind) return false;

        if (normalizeText(filters.neighborhood) !== normalizeText("Oricare")) {
          const n = listingNeighborhoodFromTitle(listing.title);
          if (!n) return false;
          if (normalizeText(n) !== normalizeText(filters.neighborhood)) return false;
        }

        const range = parseBudgetRange(filters.budget);
        if (range) {
          const price = parseEuroAmount(listing.price);
          if (price == null) return false;
          if (price < range.min || price > range.max) return false;
        }

        if (filters.id.trim()) {
          if (normalizeText(listing.id) !== normalizeText(filters.id)) return false;
        }

        return true;
      })
    : featuredListings;

  const apartments = featuredListings.filter((l) => l.kind === "apartment");
  const houses = featuredListings.filter((l) => l.kind === "house");

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
          <HomeLinkScrollTop className="group inline-flex items-center gap-2">
            <span className="inline-flex size-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-6v-7H10v7H4a1 1 0 0 1-1-1v-10.5Z" />
              </svg>
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight text-slate-900">
                Sig Imobiliare Cluj
              </div>
              <div className="text-xs text-slate-500">Listări</div>
            </div>
          </HomeLinkScrollTop>

          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <HomeLinkScrollTop className="hover:text-slate-900">
              Acasa
            </HomeLinkScrollTop>
            <ScrollTopLink className="hover:text-slate-900" href="/listari">
              Listări
            </ScrollTopLink>
            <Link className="hover:text-slate-900" href="/servicii">
              Echipa
            </Link>
            <Link className="hover:text-slate-900" href="/contact">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Programează o vizionare
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6">
        <QuickRequestForm action="/listari" variant="bar" defaultValues={filters} />

        <div className="mt-10 flex flex-col gap-2">
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Listări: apartamente & case
          </h1>
          <p className="text-pretty text-sm text-slate-600 sm:text-base">
            Aici găsești toate apartamentele și casele. (Terenurile sunt pe alt
            flux.)
          </p>
          {active ? (
            <p className="text-sm text-slate-600">
              Rezultate:{" "}
              <span className="font-semibold text-slate-900">{filtered.length}</span>
            </p>
          ) : null}
        </div>

        {active ? (
          <section className="mt-10">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Rezultate
            </h2>
            {filtered.length ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
                Nu există oferte care să se potrivească acestor criterii.
              </div>
            )}
          </section>
        ) : (
          <>
            <section className="mt-10">
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Apartamente
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {apartments.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </section>

            <section className="mt-12">
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Case
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {houses.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

