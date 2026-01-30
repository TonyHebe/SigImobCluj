"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

import { BrandMark } from "@/components/BrandMark";
import { HomeLinkScrollTop } from "@/components/HomeLinkScrollTop";
import { ListingLocationCard } from "@/components/ListingLocationCard";
import { ScrollTopLink } from "@/components/ScrollTopLink";
import { getAuthSnapshot } from "@/lib/authClient";
import { useListingRemote } from "@/lib/useListingsRemote";

export default function OfferDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";

  const auth = (() => {
    try {
      return getAuthSnapshot();
    } catch {
      return { isAuthed: false, role: "user" as const, email: "" };
    }
  })();

  const isAdmin = auth.isAuthed && auth.role === "admin";
  const { listing, isLoading, error } = useListingRemote(id);

  const cover = listing?.images?.[0] ?? null;

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
              <div className="text-xs text-slate-500">Detalii ofertă</div>
            </div>
          </HomeLinkScrollTop>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Link
                href={`/admin/oferte?edit=${encodeURIComponent(id)}`}
                className="hidden items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 sm:inline-flex"
              >
                Editează oferta
              </Link>
            ) : null}
            <ScrollTopLink
              href="/listari"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Înapoi la listări
            </ScrollTopLink>
            <Link
              href="/vizionare"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Programează o vizionare
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {error ? (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800 shadow-sm">
            {error}
          </div>
        ) : isLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
            Se încarcă oferta…
          </div>
        ) : !listing ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-sm font-semibold text-slate-900">
              Oferta nu există (ID: {id})
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Dacă tocmai ai creat oferta, încearcă refresh. Dacă tot nu apare,
              verifică să fii pe același mediu (prod vs local) și să folosești
              aceeași bază de date.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ScrollTopLink
                href="/listari"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Înapoi la listări
              </ScrollTopLink>
              {isAdmin ? (
                <Link
                  href="/admin/oferte?new=1"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                >
                  Creează ofertă nouă
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {listing.badge}
                </div>
                <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  {listing.title}
                </h1>
                <p className="mt-2 text-pretty text-sm text-slate-600 sm:text-base">
                  {listing.subtitle}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <div className="text-xs font-semibold text-slate-500">Preț</div>
                <div className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                  {listing.price}
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  ID: {listing.id}
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-5">
              <section className="lg:col-span-3">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative h-[320px] sm:h-[420px]">
                    {cover?.src ? (
                      <Image
                        src={cover.src}
                        alt={cover.alt ?? listing.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 66vw, 60vw"
                        className="object-cover"
                        priority
                      />
                    ) : null}
                  </div>
                  <div className="grid gap-3 p-4 sm:grid-cols-3">
                    {listing.images.slice(1).map((img) => (
                      <div
                        key={img.src}
                        className="relative h-28 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50"
                      >
                        <Image
                          src={img.src}
                          alt={img.alt}
                          fill
                          sizes="(max-width: 640px) 33vw, 200px"
                          className="object-cover"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <aside className="lg:col-span-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900">
                    Detalii rapide
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

                  <div className="mt-6 text-sm font-semibold text-slate-900">
                    Descriere
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {listing.description}
                  </p>

                  <div className="mt-6 grid gap-3">
                    <Link
                      href="/vizionare"
                      className="inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-sky-500"
                    >
                      Cere detalii / programează vizionare
                    </Link>
                    <ScrollTopLink
                      href="/listari"
                      className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                    >
                      Vezi și alte oferte
                    </ScrollTopLink>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                    Notă: ofertele sunt încărcate din baza de date.
                  </div>
                </div>

                {listing.location ? (
                  <div className="mt-6">
                    <ListingLocationCard location={listing.location} />
                  </div>
                ) : null}
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

