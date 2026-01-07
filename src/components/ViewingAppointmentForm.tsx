"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";
type ErrorState =
  | {
      message: string;
      mailto?: string;
    }
  | null;

function buildDefaultSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h < 18; h += 1) {
    const start = String(h).padStart(2, "0") + ":00";
    const end = String(h + 1).padStart(2, "0") + ":00";
    slots.push(`${start}-${end}`);
  }
  slots.push("Alt interval (scrie în detalii)");
  return slots;
}

export function ViewingAppointmentForm({
  defaultPropertyType = "Apartament",
}: {
  defaultPropertyType?: "Apartament" | "Casă";
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<ErrorState>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [propertyType, setPropertyType] = useState(defaultPropertyType);
  const timeSlots = useMemo(() => buildDefaultSlots(), []);
  const [timeSlot, setTimeSlot] = useState(timeSlots[0] ?? "09:00-10:00");
  const [details, setDetails] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;

    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/vizionare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          source: "viewing-appointment",
          name,
          phone,
          email,
          propertyType,
          timeSlot,
          details,
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
      setName("");
      setPhone("");
      setEmail("");
      setPropertyType(defaultPropertyType);
      setTimeSlot(timeSlots[0] ?? "09:00-10:00");
      setDetails("");
    } catch (err) {
      setStatus("error");
      setError({
        message:
          err instanceof Error ? err.message : "Cererea nu a putut fi trimisă.",
      });
    }
  }

  return (
    <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
      <label className="grid gap-1 text-sm">
        <span className="text-slate-700">Nume</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
          autoComplete="name"
          required
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="text-slate-700">Număr de telefon</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+40..."
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-slate-700">Adresă mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
            autoComplete="email"
            placeholder="nume@exemplu.ro"
          />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="text-slate-700">Apartament / Casă</span>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value as "Apartament" | "Casă")}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <option value="Apartament">Apartament</option>
            <option value="Casă">Casă</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-slate-700">Interval orar</span>
          <select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
            required
          >
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="grid gap-1 text-sm">
        <span className="text-slate-700">Detalii</span>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          className="min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
          placeholder="Ex: ID ofertă / link, zona, preferințe, număr persoane, orice detaliu util."
          required
        />
      </label>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending"
          ? "Se trimite..."
          : status === "sent"
            ? "Trimis"
            : "Trimite cererea"}
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
          Cerere trimisă. Te contactăm cât de curând pentru confirmare.
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

