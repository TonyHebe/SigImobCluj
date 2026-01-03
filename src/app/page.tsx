import Image from "next/image";
import Link from "next/link";

import { featuredListings } from "@/lib/listings";

export default function HomePage() {
  const neighborhoods = [
    {
      name: "Zorilor",
      desc: "Acces rapid spre centru, aproape de universități și servicii.",
    },
    {
      name: "Gheorgheni",
      desc: "Zone verzi, conectivitate excelentă, aproape de Iulius Mall.",
    },
    {
      name: "Mărăști",
      desc: "Ideal pentru investiții, transport public și huburi de birouri.",
    },
    {
      name: "Grigorescu",
      desc: "Liniște, aer curat, promenadă pe Someș și parcuri.",
    },
  ] as const;

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
          <a href="#" className="group inline-flex items-center gap-2">
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
          </a>

          <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
            <a className="hover:text-slate-900" href="#listari">
              Listări
            </a>
            <a className="hover:text-slate-900" href="#cartiere">
              Cartiere
            </a>
            <a className="hover:text-slate-900" href="#servicii">
              Servicii
            </a>
            <a className="hover:text-slate-900" href="#contact">
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Programează o vizionare
            </a>
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
                  <a
                    href="#listari"
                    className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-sky-500"
                  >
                    Vezi listările recomandate
                  </a>
                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                  >
                    Cere o ofertă personalizată
                  </a>
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
                      Completează câteva detalii — revenim cu opțiuni potrivite.
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

                <form className="mt-5 grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm">
                      <span className="text-slate-700">Tip proprietate</span>
                      <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200">
                        <option>Apartament</option>
                        <option>Casă</option>
                        <option>Teren</option>
                        <option>Spațiu comercial</option>
                      </select>
                    </label>
                    <label className="grid gap-1 text-sm">
                      <span className="text-slate-700">Cartier</span>
                      <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200">
                        <option>Oricare</option>
                        <option>Zorilor</option>
                        <option>Gheorgheni</option>
                        <option>Mărăști</option>
                        <option>Grigorescu</option>
                        <option>Centru</option>
                        <option>Făget</option>
                      </select>
                    </label>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1 text-sm">
                      <span className="text-slate-700">Buget (max)</span>
                      <input
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                        placeholder="ex: 180000"
                        inputMode="numeric"
                      />
                    </label>
                    <label className="grid gap-1 text-sm">
                      <span className="text-slate-700">Telefon</span>
                      <input
                        className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
                        placeholder="ex: 07xx xxx xxx"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                  >
                    Trimite cererea
                  </button>

                  <p className="text-xs text-slate-500">
                    Exemplu de formular (fără trimitere reală). Îl putem conecta
                    la email/CRM când vrei.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section id="listari" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="flex items-end justify-between gap-6">
            <div>
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Listări recomandate în Cluj
              </h2>
              <p className="mt-2 text-pretty text-sm text-slate-600 sm:text-base">
                Selecție demonstrativă pentru un aspect “real” de site. Putem
                conecta listările la un CMS sau la un feed intern.
              </p>
            </div>
            <a
              href="#contact"
              className="hidden items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-800 sm:inline-flex"
            >
              Primește alerte pe email
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
            </a>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredListings.map((l) => (
              <article
                key={l.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative">
                  <div className="relative h-44 overflow-hidden bg-[linear-gradient(135deg,rgba(14,165,233,0.22),rgba(99,102,241,0.18))]">
                    <Image
                      src={l.images[0].src}
                      alt={l.images[0].alt}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition duration-300 ease-out group-hover:scale-105"
                      priority={l.id === "apt-zorilor-3cam"}
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/30 via-slate-950/10 to-transparent"
                    />
                  </div>
                  <div className="absolute left-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm">
                    {l.badge}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        <Link
                          href={`/oferte/${l.id}`}
                          className="outline-none hover:underline focus-visible:rounded focus-visible:ring-2 focus-visible:ring-sky-200"
                        >
                          {l.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {l.subtitle}
                      </p>
                    </div>
                    <div className="shrink-0 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
                      {l.price}
                    </div>
                  </div>

                  <ul className="mt-4 flex flex-wrap gap-2">
                    {l.details.map((d) => (
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
                      href={`/oferte/${l.id}`}
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
                    <span className="text-xs text-slate-500">
                      ID: {l.id}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section
          id="cartiere"
          className="border-y border-slate-200/70 bg-white"
        >
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div>
                <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                  Cartiere populare în Cluj‑Napoca
                </h2>
                <p className="mt-3 text-pretty text-sm text-slate-600 sm:text-base">
                  Îți recomandăm zonele potrivite în funcție de buget, stil de
                  viață și acces (școli, birouri, transport, parcuri).
                </p>
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-sm font-semibold text-slate-900">
                    Sfat rapid
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    Pentru investiții: Mărăști / Gheorgheni. Pentru liniște:
                    Grigorescu / Făget. Pentru conectivitate: Zorilor / Centru.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {neighborhoods.map((n) => (
                  <div
                    key={n.name}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="size-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
                          <path d="M12 10.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
                        </svg>
                      </span>
                      <div className="text-sm font-semibold text-slate-900">
                        {n.name}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{n.desc}</p>
                    <a
                      href="#contact"
                      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-800"
                    >
                      Cere oferte în zonă
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
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="servicii" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Servicii complete, fără stres
              </h2>
              <p className="mt-3 text-pretty text-sm text-slate-600 sm:text-base">
                Ne ocupăm de prezentare, verificări, negociere și documentație —
                ca tu să iei decizia corectă, informat.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
              {[
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
              ].map((s) => (
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
                  Vrei să vinzi sau să închiriezi în Cluj?
                </h3>
                <p className="mt-2 text-pretty text-sm text-white/80 sm:text-base">
                  Îți propunem un plan clar: preț, timeline, marketing și pașii
                  legali — totul pe înțelesul tău.
                </p>
              </div>
              <div className="flex md:justify-end">
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                >
                  Cere evaluare gratuită
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                Contact
              </h2>
              <p className="mt-3 text-pretty text-sm text-slate-600 sm:text-base">
                Spune‑ne ce cauți și îți trimitem opțiuni potrivite. (Datele de
                mai jos sunt demonstrative.)
              </p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900">
                    Telefon
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    <a className="hover:text-slate-900" href="tel:+40700000000">
                      +40 700 000 000
                    </a>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900">
                    Email
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    <a
                      className="hover:text-slate-900"
                      href="mailto:contact@sigimobiliarecluj.ro"
                    >
                      contact@sigimobiliarecluj.ro
                    </a>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-semibold text-slate-900">
                    Program
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    Luni–Vineri: 09:00–18:00 • Sâmbătă: 10:00–14:00
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-900">
                Trimite un mesaj
              </div>
              <form className="mt-4 grid gap-3">
                <label className="grid gap-1 text-sm">
                  <span className="text-slate-700">Nume</span>
                  <input className="h-11 rounded-xl border border-slate-200 bg-white px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200" />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-slate-700">Email</span>
                  <input
                    type="email"
                    className="h-11 rounded-xl border border-slate-200 bg-white px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-slate-700">Mesaj</span>
                  <textarea className="min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200" />
                </label>
                <button
                  type="button"
                  className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-sky-500"
                >
                  Trimite
                </button>
                <p className="text-xs text-slate-500">
                  Formular demo (fără backend). La nevoie, îl conectăm la email,
                  CRM sau un endpoint.
                </p>
              </form>
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
              <a className="text-slate-600 hover:text-slate-900" href="#listari">
                Listări
              </a>
              <a
                className="text-slate-600 hover:text-slate-900"
                href="#servicii"
              >
                Servicii
              </a>
              <a className="text-slate-600 hover:text-slate-900" href="#contact">
                Contact
              </a>
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
