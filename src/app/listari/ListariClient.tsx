"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { BrandMark } from "@/components/BrandMark";
import { HomeLinkScrollTop } from "@/components/HomeLinkScrollTop";
import { QuickRequestForm } from "@/components/QuickRequestForm";
import { ScrollTopLink } from "@/components/ScrollTopLink";
import { getAuthSnapshot } from "@/lib/authClient";
import type { Listing } from "@/lib/listings";
import { deleteListingRemote } from "@/lib/listingsRemote";
import { useListingsRemote } from "@/lib/useListingsRemote";

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
  isAdmin,
  onDelete,
  isDeleting,
}: {
  listing: Listing;
  isAdmin: boolean;
  onDelete?: (id: string) => void;
  isDeleting?: boolean;
}) {
  const cover = listing.images[0];
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative">
        <div className="relative h-44 overflow-hidden bg-[linear-gradient(135deg,rgba(14,165,233,0.22),rgba(99,102,241,0.18))]">
          {cover?.src ? (
            <Image
              src={cover.src}
              alt={cover.alt ?? listing.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-300 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : null}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/30 via-slate-950/10 to-transparent"
          />
        </div>
        <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
          {listing.badge}
        </div>
        {isAdmin ? (
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <Link
              href={`/admin/oferte?edit=${encodeURIComponent(listing.id)}`}
              className="inline-flex items-center justify-center rounded-lg bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm hover:bg-white"
            >
              Editează
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-rose-500"
              disabled={isDeleting}
              onClick={() => {
                const ok = window.confirm(
                  `Ștergi oferta “${listing.title}” (ID: ${listing.id})?`,
                );
                if (!ok) return;
                onDelete?.(listing.id);
              }}
            >
              {isDeleting ? "Șterg…" : "Șterge"}
            </button>
          </div>
        ) : null}
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

function hasActiveFilters(filters: {
  propertyType: string;
  neighborhood: string;
  budget: string;
  id: string;
}) {
  const propertyTypeActive =
    normalizeText(filters.propertyType) !== normalizeText("Oricare");
  const neighborhoodActive =
    normalizeText(filters.neighborhood) !== normalizeText("Oricare");
  const budgetActive = !!filters.budget.trim();
  const idActive = !!filters.id.trim();
  return propertyTypeActive || neighborhoodActive || budgetActive || idActive;
}

const PAGE_SIZE = 25;

function getPageNumbers(current: number, total: number) {
  if (total <= 1) return [1];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: Array<number | "…"> = [];
  const push = (v: number | "…") => {
    if (out[out.length - 1] === v) return;
    out.push(v);
  };

  push(1);
  const left = Math.max(2, current - 1);
  const right = Math.min(total - 1, current + 1);
  if (left > 2) push("…");
  for (let p = left; p <= right; p++) push(p);
  if (right < total - 1) push("…");
  push(total);
  return out;
}

export function ListariClientPage({
  filters,
  page,
}: {
  filters: {
    propertyType: string;
    neighborhood: string;
    budget: string;
    id: string;
  };
  page: number;
}) {
  const router = useRouter();
  const auth = (() => {
    try {
      return getAuthSnapshot();
    } catch {
      return { isAuthed: false, role: "user" as const, email: "" };
    }
  })();

  const isAdmin = auth.isAuthed && auth.role === "admin";
  const { listings, isLoading, error, refetch } = useListingsRemote();
  const [deleteBusyId, setDeleteBusyId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const active = useMemo(() => hasActiveFilters(filters), [filters]);

  const filtered = useMemo(() => {
    if (!active) return listings;
    return listings.filter((listing) => {
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
    });
  }, [active, filters.budget, filters.id, filters.neighborhood, filters.propertyType, listings]);

  const base = useMemo(() => {
    if (active) return filtered;
    // `/listari` shows apartments + houses (land is a different flow).
    return listings.filter((l) => l.kind !== "land");
  }, [active, filtered, listings]);

  const totalPages = useMemo(() => {
    if (!base.length) return 1;
    return Math.max(1, Math.ceil(base.length / PAGE_SIZE));
  }, [base.length]);

  const currentPage = useMemo(() => {
    const p = Number.isFinite(page) ? Math.floor(page) : 1;
    const clamped = Math.min(Math.max(1, p), totalPages);
    return clamped;
  }, [page, totalPages]);

  useEffect(() => {
    if (page === currentPage) return;
    const sp =
      typeof window === "undefined"
        ? new URLSearchParams()
        : new URLSearchParams(window.location.search);
    if (currentPage <= 1) sp.delete("page");
    else sp.set("page", String(currentPage));
    const qs = sp.toString();
    router.replace(qs ? `/listari?${qs}` : "/listari");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, page]);

  const pageSlice = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return base.slice(start, start + PAGE_SIZE);
  }, [base, currentPage]);

  const apartments = useMemo(
    () => pageSlice.filter((l) => l.kind === "apartment"),
    [pageSlice],
  );
  const houses = useMemo(
    () => pageSlice.filter((l) => l.kind === "house"),
    [pageSlice],
  );

  const goToPage = (nextPage: number) => {
    const target = Math.min(Math.max(1, Math.floor(nextPage)), totalPages);
    const sp =
      typeof window === "undefined"
        ? new URLSearchParams()
        : new URLSearchParams(window.location.search);
    if (target <= 1) sp.delete("page");
    else sp.set("page", String(target));
    const qs = sp.toString();
    router.push(qs ? `/listari?${qs}` : "/listari");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
          <HomeLinkScrollTop className="group inline-flex items-center gap-2">
            <BrandMark className="size-9" />
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
            {isAdmin ? (
              <Link
                href="/admin/oferte"
                className="hidden items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 sm:inline-flex"
              >
                Admin: Oferte
              </Link>
            ) : null}
            <Link
              href="/vizionare"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Programează o vizionare
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6">
        <QuickRequestForm
          action="/listari"
          variant="bar"
          defaultValues={filters}
        />

        {error || deleteError ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            {deleteError ?? error}
          </div>
        ) : null}
        {isLoading ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            Se încarcă ofertele…
          </div>
        ) : null}

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
              <span className="font-semibold text-slate-900">
                {filtered.length}
              </span>
            </p>
          ) : null}
        </div>

        {active ? (
          <section className="mt-10">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Rezultate
            </h2>
            {base.length ? (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {pageSlice.map((l) => (
                  <ListingCard
                    key={l.id}
                    listing={l}
                    isAdmin={isAdmin}
                    isDeleting={deleteBusyId === l.id}
                    onDelete={
                      isAdmin
                        ? async (id) => {
                            setDeleteError(null);
                            setDeleteBusyId(id);
                            try {
                              await deleteListingRemote(id);
                              refetch();
                            } catch (err) {
                              const message =
                                err instanceof Error ? err.message : String(err);
                              setDeleteError(message || "Eroare la ștergere.");
                            } finally {
                              setDeleteBusyId(null);
                            }
                          }
                        : undefined
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
                Nu există oferte care să se potrivească acestor criterii.
              </div>
            )}

            {base.length > PAGE_SIZE ? (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-600">
                  Pagina{" "}
                  <span className="font-semibold text-slate-900">
                    {currentPage}
                  </span>{" "}
                  din{" "}
                  <span className="font-semibold text-slate-900">
                    {totalPages}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    Înapoi
                  </button>
                  <div className="flex flex-wrap items-center gap-1">
                    {pageNumbers.map((p, idx) =>
                      p === "…" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-2 text-sm text-slate-500"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          type="button"
                          className={
                            p === currentPage
                              ? "inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white shadow-sm"
                              : "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                          }
                          onClick={() => goToPage(p)}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={currentPage >= totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Înainte
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        ) : (
          <>
            <section className="mt-10">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Apartamente
                </h2>
                {isAdmin ? (
                  <Link
                    href="/admin/oferte?new=1"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                  >
                    Adaugă ofertă
                  </Link>
                ) : null}
              </div>
              {apartments.length ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {apartments.map((l) => (
                    <ListingCard
                      key={l.id}
                      listing={l}
                      isAdmin={isAdmin}
                      isDeleting={deleteBusyId === l.id}
                      onDelete={
                        isAdmin
                          ? async (id) => {
                              setDeleteError(null);
                              setDeleteBusyId(id);
                              try {
                                await deleteListingRemote(id);
                                refetch();
                              } catch (err) {
                                const message =
                                  err instanceof Error ? err.message : String(err);
                                setDeleteError(message || "Eroare la ștergere.");
                              } finally {
                                setDeleteBusyId(null);
                              }
                            }
                          : undefined
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
                  Nu sunt apartamente pe această pagină.
                </div>
              )}
            </section>

            <section className="mt-12">
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Case
              </h2>
              {houses.length ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {houses.map((l) => (
                    <ListingCard
                      key={l.id}
                      listing={l}
                      isAdmin={isAdmin}
                      isDeleting={deleteBusyId === l.id}
                      onDelete={
                        isAdmin
                          ? async (id) => {
                              setDeleteError(null);
                              setDeleteBusyId(id);
                              try {
                                await deleteListingRemote(id);
                                refetch();
                              } catch (err) {
                                const message =
                                  err instanceof Error ? err.message : String(err);
                                setDeleteError(message || "Eroare la ștergere.");
                              } finally {
                                setDeleteBusyId(null);
                              }
                            }
                          : undefined
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700 shadow-sm">
                  Nu sunt case pe această pagină.
                </div>
              )}
            </section>

            {base.length > PAGE_SIZE ? (
              <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-sm text-slate-600">
                  Pagina{" "}
                  <span className="font-semibold text-slate-900">
                    {currentPage}
                  </span>{" "}
                  din{" "}
                  <span className="font-semibold text-slate-900">
                    {totalPages}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={currentPage <= 1}
                    onClick={() => goToPage(currentPage - 1)}
                  >
                    Înapoi
                  </button>
                  <div className="flex flex-wrap items-center gap-1">
                    {pageNumbers.map((p, idx) =>
                      p === "…" ? (
                        <span
                          key={`ellipsis-${idx}`}
                          className="px-2 text-sm text-slate-500"
                        >
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          type="button"
                          className={
                            p === currentPage
                              ? "inline-flex h-10 min-w-10 items-center justify-center rounded-xl bg-slate-900 px-3 text-sm font-semibold text-white shadow-sm"
                              : "inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                          }
                          onClick={() => goToPage(p)}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    type="button"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={currentPage >= totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                  >
                    Înainte
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}

