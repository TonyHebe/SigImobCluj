"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { HomeLinkScrollTop } from "@/components/HomeLinkScrollTop";
import type { QuickSearchFilters } from "@/components/QuickRequestForm";
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

function matchesFilters(listing: (typeof featuredListings)[number], f: QuickSearchFilters) {
  const kind = kindFromPropertyType(f.propertyType);
  if (kind && listing.kind !== kind) return false;

  if (normalizeText(f.neighborhood) !== normalizeText("Oricare")) {
    const n = listingNeighborhoodFromTitle(listing.title);
    if (!n) return false;
    if (normalizeText(n) !== normalizeText(f.neighborhood)) return false;
  }

  const range = parseBudgetRange(f.budget);
  if (range) {
    const price = parseEuroAmount(listing.price);
    if (price == null) return false;
    if (price < range.min || price > range.max) return false;
  }

  return true;
}

function ListingCard({ listing }: { listing: (typeof featuredListings)[number] }) {
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

export default function HomePage() {
  const [appliedFilters, setAppliedFilters] = useState<QuickSearchFilters | null>(null);

  const filteredListings = useMemo(() => {
    if (!appliedFilters) return featuredListings;
    return featuredListings.filter((l) => matchesFilters(l, appliedFilters));
  }, [appliedFilters]);

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
              <div className="text-xs text-slate-500">
                Cluj‑Napoca • vânzare & închiriere
              </div>
            </div>
          </HomeLinkScrollTop>

          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <HomeLinkScrollTop className="hover:text-slate-900">
              Acasa
            </HomeLinkScrollTop>
            <a className="hover:text-slate-900" href="#despre-noi">
              Despre noi
            </a>
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

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_20%_10%,rgba(14,165,233,0.18),transparent_55%),radial-gradient(800px_circle_at_80%_0%,rgba(99,102,241,0.14),transparent_55%)]"
          />
          <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                  <span className="inline-flex size-2 rounded-full bg-emerald-500" />
                  Consultanță completă • selecție atentă • tranzacții sigure
                </div>
                <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  Găsește proprietatea potrivită în Cluj‑Napoca.
                </h1>
                <p className="mt-4 text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
                  De la apartamente în Zorilor și Gheorgheni, până la case în
                  Făget — îți prezentăm doar opțiuni verificate, cu detalii
                  clare și sprijin cap‑coadă.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <ScrollTopLink
                    href="/listari"
                    className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500"
                  >
                    Vezi listările recomandate
                  </ScrollTopLink>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                  >
                    Cere o ofertă personalizată
                  </Link>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      250+
                    </div>
                    <div className="text-xs text-slate-600">
                      cereri gestionate / lună
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      48h
                    </div>
                    <div className="text-xs text-slate-600">
                      timp mediu feedback
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      4.9/5
                    </div>
                    <div className="text-xs text-slate-600">
                      satisfacție clienți
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Caută rapid
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      Alege criteriile și apasă “Cauta” pentru a vedea ofertele potrivite.
                    </div>
                  </div>
                  <div className="hidden items-center gap-1 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 sm:flex">
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
                      <path d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                    </svg>
                    Cluj‑Napoca
                  </div>
                </div>

                <QuickRequestForm onSearch={setAppliedFilters} />
              </div>
            </div>

            <div className="mt-10">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                    {appliedFilters ? "Oferte potrivite" : "Oferte recomandate"}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {appliedFilters
                      ? `Afișăm ${filteredListings.length} rezultate pentru criteriile selectate.`
                      : `Afișăm ${featuredListings.length} oferte disponibile.`}
                  </p>
                </div>
                <ScrollTopLink
                  href="/listari"
                  className="hidden items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 sm:inline-flex"
                >
                  Vezi toate
                </ScrollTopLink>
              </div>

              {filteredListings.length ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredListings.map((l) => (
                    <ListingCard key={l.id} listing={l} />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
                  Nu există oferte care să se potrivească acestor criterii.
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="despre-noi" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Despre noi
              </h2>
              <p className="mt-3 text-pretty text-sm text-slate-600 sm:text-base">
                Sig Imobiliare Cluj este o agenție imobiliară din Cluj‑Napoca,
                fondată în 2025 de un grup de agenți imobiliari cu experiență.
                Punem accent pe transparență, comunicare clară și recomandări
                bazate pe date reale din piață — ca tu să iei decizia corectă,
                informat.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
              {[
                {
                  title: "Cluj‑Napoca, local",
                  desc: "Cunoaștem cartierele, prețurile și dinamica pieței — de la centru la zonele în dezvoltare.",
                },
                {
                  title: "Fondată în 2025",
                  desc: "O echipă nouă, energică, dar cu experiență solidă în tranzacții și relația cu clienții.",
                },
                {
                  title: "Agenți specializați",
                  desc: "Consultanți dedicați pe tipuri de proprietăți, cu recomandări obiective și pași clari.",
                },
                {
                  title: "Cap‑coadă, fără bătăi de cap",
                  desc: "De la selecție și vizionări, până la negociere și actele finale — rămâi mereu informat.",
                },
              ].map((s) => (
                <div
                  key={s.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
                        <path d="M12 8v4" />
                        <path d="M12 16h.01" />
                      </svg>
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        {s.title}
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-900">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <div className="grid items-center gap-6 md:grid-cols-3">
              <div className="md:col-span-2">
                <h3 className="text-balance text-2xl font-semibold tracking-tight text-white">
                  Vrei să vinzi sau să închiriezi în Cluj?
                </h3>
                <p className="mt-2 text-pretty text-sm text-white/80 sm:text-base">
                  Îți propunem un plan clar: preț, timeline, marketing și pașii
                  legali — totul pe înțelesul tău.
                </p>
              </div>
              <div className="flex md:justify-end">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                >
                  Cere evaluare gratuită
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200/70 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-600">
              <span className="font-semibold text-slate-900">
                Sig Imobiliare Cluj
              </span>{" "}
              — agenție imobiliară în Cluj‑Napoca.
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <ScrollTopLink
                className="text-slate-600 hover:text-slate-900"
                href="/listari"
              >
                Listări
              </ScrollTopLink>
              <a
                className="text-slate-600 hover:text-slate-900"
                href="/servicii"
              >
                Echipa
              </a>
              <Link className="text-slate-600 hover:text-slate-900" href="/contact">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-6 text-xs text-slate-500">
            © {new Date().getFullYear()} Sig Imobiliare Cluj. Toate drepturile
            rezervate.
          </div>
        </div>
      </footer>
    </div>
  );
}
