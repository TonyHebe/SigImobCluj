"use client";

import { useId, useMemo, useState } from "react";

type Review = {
  name: string;
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  context?: string;
};

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={`size-4 ${filled ? "text-amber-400" : "text-slate-300"}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path
        strokeLinejoin="round"
        d="M11.48 3.5a.6.6 0 0 1 1.04 0l2.66 5.4c.1.2.3.34.53.37l5.96.86a.6.6 0 0 1 .33 1.02l-4.31 4.2c-.17.16-.25.4-.21.63l1.02 5.93a.6.6 0 0 1-.87.64l-5.33-2.8a.6.6 0 0 0-.56 0l-5.33 2.8a.6.6 0 0 1-.87-.64l1.02-5.93a.6.6 0 0 0-.21-.63l-4.31-4.2a.6.6 0 0 1 .33-1.02l5.96-.86a.6.6 0 0 0 .53-.37l2.66-5.4Z"
      />
    </svg>
  );
}

function Stars({ rating, labelId }: { rating: number; labelId: string }) {
  return (
    <div className="flex items-center gap-1" aria-labelledby={labelId}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} filled={i + 1 <= rating} />
      ))}
    </div>
  );
}

export function ReviewsCarousel() {
  const labelId = useId();

  const reviews = useMemo<Review[]>(
    () => [
      {
        name: "Andreea Pop",
        rating: 5,
        context: "Apartament în Gheorgheni",
        text: "Comunicare excelentă și transparență la fiecare pas. Am primit recomandări potrivite bugetului și am închis tranzacția rapid, fără stres.",
      },
      {
        name: "Mihai Ionescu",
        rating: 5,
        context: "Închiriere în Zorilor",
        text: "Foarte profesioniști și punctuali. Au selectat doar opțiuni relevante și mi-au explicat clar toate detaliile contractuale.",
      },
      {
        name: "Ioana Dumitru",
        rating: 5,
        context: "Casă în Făget",
        text: "Am apreciat răbdarea și atenția la detalii. Vizionări bine organizate, plus suport complet până la semnare. Recomand cu încredere!",
      },
      {
        name: "Radu Stan",
        rating: 4,
        context: "Vânzare garsonieră, Mărăști",
        text: "Procesul a fost foarte bine structurat, cu feedback constant. Negocierea a fost gestionată corect și am obținut un preț bun.",
      },
      {
        name: "Elena Marin",
        rating: 5,
        context: "Căutare teren, Florești",
        text: "Ne-au ajutat să evităm capcanele din acte și să verificăm rapid proprietatea. Seriozitate și promptitudine.",
      },
    ],
    [],
  );

  const [index, setIndex] = useState(0);
  const current = reviews[index]!;

  function prev() {
    setIndex((i) => (i - 1 + reviews.length) % reviews.length);
  }

  function next() {
    setIndex((i) => (i + 1) % reviews.length);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-900">Recenzii</div>
          <div className="mt-1 flex items-center gap-3">
            <span id={labelId} className="sr-only">
              Rating {current.rating} din 5
            </span>
            <Stars rating={current.rating} labelId={labelId} />
            <span className="text-xs text-slate-500">
              {index + 1}/{reviews.length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            aria-label="Recenzia anterioară"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Recenzia următoare"
            className="inline-flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="text-sm font-semibold text-slate-900">{current.name}</div>
          {current.context ? (
            <div className="text-xs text-slate-500">{current.context}</div>
          ) : null}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          “{current.text}”
        </p>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {reviews.map((_, i) => {
          const active = i === index;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Mergi la recenzia ${i + 1}`}
              aria-current={active ? "true" : undefined}
              className={`h-2.5 w-2.5 rounded-full transition ${
                active ? "bg-sky-600" : "bg-slate-300 hover:bg-slate-400"
              }`}
            />
          );
        })}
      </div>
    </section>
  );
}

