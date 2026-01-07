import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { HomeLinkScrollTop } from "@/components/HomeLinkScrollTop";
import { ScrollTopLink } from "@/components/ScrollTopLink";
import { featuredListings, getListingById } from "@/lib/listings";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return featuredListings.map((l) => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = getListingById(id);
  if (!listing) return {};

  return {
    title: `${listing.title} — Sig Imobiliare Cluj`,
    description: listing.subtitle,
    openGraph: {
      title: listing.title,
      description: listing.subtitle,
      images: listing.images.slice(0, 1).map((img) => ({
        url: img.src,
        alt: img.alt,
      })),
    },
  };
}

export default async function OfferDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const listing = getListingById(id);

  if (!listing) {
    notFound();
  }

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
              <div className="text-xs text-slate-500">Detalii ofertă</div>
            </div>
          </HomeLinkScrollTop>

          <div className="flex items-center gap-2">
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
            <div className="mt-3 text-xs text-slate-500">ID: {listing.id}</div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="relative h-[320px] sm:h-[420px]">
                <Image
                  src={listing.images[0].src}
                  alt={listing.images[0].alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
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
                      sizes="(min-width: 1024px) 20vw, 33vw"
                      className="object-cover"
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
                Notă: imaginile și datele sunt demonstrative. Putem conecta
                listările la un CMS sau la o bază de date când vrei.
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

