"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactMessageForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

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
          source: "contact-form",
          name,
          email,
          message,
        }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Mesajul nu a putut fi trimis.");
      }

      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Mesajul nu a putut fi trimis.");
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
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-slate-700">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-11 rounded-xl border border-slate-200 bg-white px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
          autoComplete="email"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="text-slate-700">Mesaj</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-28 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
          required
        />
      </label>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? "Se trimite..." : status === "sent" ? "Trimis" : "Trimite"}
      </button>

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      {status === "sent" ? (
        <p className="text-xs text-emerald-700">
          Mesaj trimis. Îți răspundem cât de curând.
        </p>
      ) : (
        <p className="text-xs text-slate-500">
          Mesajul ajunge pe emailul de contact (necesită configurare SMTP pe
          server).
        </p>
      )}
    </form>
  );
}

