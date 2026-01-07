import type { Metadata } from "next";
import { existsSync } from "node:fs";
import { join } from "node:path";
import Image from "next/image";
import Link from "next/link";

import { HomeLinkScrollTop } from "@/components/HomeLinkScrollTop";
import { ScrollTopLink } from "@/components/ScrollTopLink";

export const metadata: Metadata = {
  title: "Echipa | Sig Imobiliare Cluj",
  description:
    "Echipa Sig Imobiliare Cluj: consultanță, marketing, vizionări, negociere și sprijin complet pentru acte.",
};

const services = [
  {
    title: "Evaluare & preț corect",
    desc: "Analiză comparativă pe piața din Cluj și strategie de listare.",
  },
  {
    title: "Marketing premium",
    desc: "Prezentare profesionistă, copy clar, promovare targetată.",
  },
  {
    title: "Screening & vizionări",
    desc: "Filtrăm cererile și organizăm vizionări eficiente.",
  },
  {
    title: "Negociere & acte",
    desc: "Sprijin în ofertare, antecontract, creditare și notar.",
  },
];

const teamMembers = [
  {
    name: "Marius",
    desc: "Consultant imobiliar — evaluare, strategie de listare și negociere.",
  },
  {
    name: "Adrian",
    desc: "Marketing & promovare — prezentare clară, campanii targetate și vizibilitate.",
  },
  {
    name: "Elena",
    desc: "Acte & suport tranzacție — verificări, coordonare notariat și pași administrativi.",
  },
  {
    name: "Oana",
    desc: "Relația cu clienții — programări, follow‑up rapid și comunicare constantă.",
  },
  {
    name: "Cristian",
    desc: "Analiză & investiții — comparații de piață, randamente și recomandări pragmatice.",
  },
] as const;

function getTeamImageSrc() {
  const candidates = [
    "ba7f05ba11a94dd0ba5e84a117713a13.jpg",
    "team.webp",
    "team.jpg",
    "team.jpeg",
    "team.png",
  ] as const;

  for (const filename of candidates) {
    const localPath = join(process.cwd(), "public", "servicii", filename);
    if (existsSync(localPath)) return `/servicii/${filename}`;
  }

  return "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80";
}

export default function ServiciiPage() {
  const teamImageSrc = getTeamImageSrc();

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
              <div className="text-xs text-slate-500">Echipa</div>
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

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_circle_at_20%_10%,rgba(14,165,233,0.18),transparent_55%),radial-gradient(800px_circle_at_80%_0%,rgba(99,102,241,0.14),transparent_55%)]"
          />
          <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                  <span className="inline-flex size-2 rounded-full bg-emerald-500" />
                  Consultanță completă • selecție atentă • tranzacții sigure
                </div>
                <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                  Echipa care îți simplifică tranzacția imobiliară.
                </h1>
                <p className="mt-4 text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
                  Suntem alături de tine de la prima discuție până la semnare:
                  prezentare, verificări, vizionări, negociere și documentație.
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
              </div>

              <div className="relative">
                <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <Image
                    src={teamImageSrc}
                    alt="Echipa Sig Imobiliare Cluj în birou"
                    fill
                    priority
                    sizes="(min-width: 1024px) 45vw, 100vw"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/25 via-slate-950/5 to-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              Echipa
            </h2>
            <p className="text-pretty text-sm text-slate-600 sm:text-base">
              Câte un specialist pentru fiecare etapă: comunicare, marketing,
              negociere și documentație.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {teamMembers.map((m) => (
              <div
                key={m.name}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {m.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Ce facem pentru tine
              </h2>
              <p className="mt-3 text-pretty text-sm text-slate-600 sm:text-base">
                Un proces clar, cu pași expliciți și comunicare rapidă, ca să
                economisești timp și să eviți surprizele.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
              {services.map((s) => (
                <div
                  key={s.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="size-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M20 6 9 17l-5-5" />
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
                  Spune-ne ce cauți, iar noi revenim cu opțiuni potrivite.
                </h3>
                <p className="mt-2 text-pretty text-sm text-white/80 sm:text-base">
                  Trimite-ne bugetul și zona, iar îți pregătim o selecție clară,
                  cu pași recomandați pentru următoarea mișcare.
                </p>
              </div>
              <div className="flex md:justify-end">
                <Link
                  href="/contact"
                  className="inline-flex min-w-[200px] items-center justify-start rounded-xl bg-white py-3 pl-7 pr-8 text-base font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                >
                  Contactează-ne
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

