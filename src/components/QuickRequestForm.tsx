"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";
type ErrorState =
  | {
      message: string;
      mailto?: string;
    }
  | null;

export function QuickRequestForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<ErrorState>(null);

  const [propertyType, setPropertyType] = useState("Apartament");
  const [neighborhood, setNeighborhood] = useState("Oricare");
  const [budget, setBudget] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source: "quick-request",
          propertyType,
          neighborhood,
          budget,
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        code?: string;
        contactEmail?: string;
      };
      if (!res.ok || !data.ok) {
        setStatus("error");

        if (data.code === "SMTP_NOT_CONFIGURED" && data.contactEmail) {
          setError({
            message:
              "Momentan formularul nu poate trimite emailuri automat. Te rugăm să ne scrii direct:",
            mailto: `mailto:${data.contactEmail}`,
          });
          return;
        }

        setError({ message: data.error || "Cererea nu a putut fi trimisă." });
        return;
      }

      setStatus("sent");
      setBudget("");
    } catch (err) {
      setStatus("error");
      setError({
        message:
          err instanceof Error ? err.message : "Cererea nu a putut fi trimisă.",
      });
    }
  }

  return (
    <form className="mt-5 grid gap-3" onSubmit={onSubmit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="text-slate-700">Tip proprietate</span>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option>Apartament</option>
            <option>Casă</option>
            <option>Teren</option>
            <option>Spațiu comercial</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-slate-700">Cartier</span>
          <select
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
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
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-slate-700">Buget</span>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            required
          >
            <option value="" disabled>
              Alege intervalul
            </option>
            <option value="0–30.000 €">0–30.000 €</option>
            <option value="30.000–80.000 €">30.000–80.000 €</option>
            <option value="80.000–120.000 €">80.000–120.000 €</option>
            <option value="120.000–180.000 €">120.000–180.000 €</option>
            <option value="180.000–250.000 €">180.000–250.000 €</option>
            <option value="250.000+ €">250.000+ €</option>
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Se trimite..." : status === "sent" ? "Trimis" : "Trimite cererea"}
      </button>

      {error ? (
        <div className="text-xs text-rose-600">
          <p>{error.message}</p>
          {error.mailto ? (
            <a className="underline hover:no-underline" href={error.mailto}>
              {error.mailto.replace("mailto:", "")}
            </a>
          ) : null}
        </div>
      ) : null}
      {status === "sent" ? (
        <p className="text-xs text-emerald-700">
          Cerere trimisă. Revenim în scurt timp.
        </p>
      ) : (
        <p className="text-xs text-slate-500">
          Cererea ajunge pe emailul de contact (necesită configurare SMTP pe
          server).
        </p>
      )}
    </form>
  );
}

