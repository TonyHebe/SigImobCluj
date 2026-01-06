import type { Metadata } from "next";
import Link from "next/link";

import { ContactMessageForm } from "@/components/ContactMessageForm";
import { HomeLinkScrollTop } from "@/components/HomeLinkScrollTop";
import { ScrollTopLink } from "@/components/ScrollTopLink";

export const metadata: Metadata = {
  title: "Contact | Sig Imobiliare Cluj",
  description:
    "Contact Sig Imobiliare Cluj: telefon, email, program și formular de mesaj.",
};

export default function ContactPage() {
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
              <div className="text-xs text-slate-500">Contact</div>
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
            <Link className="font-semibold text-slate-900" href="/contact">
              Contact
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/listari"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Vezi listări
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <section className="grid gap-10 lg:grid-cols-2">
          <div>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Contact
            </h1>
            <p className="mt-3 text-pretty text-sm text-slate-600 sm:text-base">
              Spune‑ne ce cauți și îți trimitem opțiuni potrivite.
            </p>

            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">
                  Telefon
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  <a className="hover:text-slate-900" href="tel:+40755787617">
                    +40755787617
                  </a>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-sm font-semibold text-slate-900">Email</div>
                <div className="mt-2 text-sm text-slate-600">
                  <a
                    className="hover:text-slate-900"
                    href="mailto:jessicapana9@gmail.com"
                  >
                    jessicapana9@gmail.com
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
            <ContactMessageForm />
          </div>
        </section>
      </main>
    </div>
  );
}

