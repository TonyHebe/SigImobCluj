"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ScrollTopLink } from "@/components/ScrollTopLink";
import { AdminListingLocationPicker } from "@/components/AdminListingLocationPicker";
import { getAuthSnapshot } from "@/lib/authClient";
import type { Listing } from "@/lib/listings";
import {
  deleteListingRemote,
  resetListingsRemote,
  saveListing,
} from "@/lib/listingsRemote";
import { useListingsRemote } from "@/lib/useListingsRemote";

type DraftImage = {
  src: string;
  alt: string;
};

type DraftListing = {
  id: string;
  kind: Listing["kind"];
  badge: string;
  title: string;
  subtitle: string;
  price: string;
  locationLabel: string;
  locationLat: string;
  locationLng: string;
  locationRadiusMeters: string;
  detailsText: string;
  description: string;
  images: DraftImage[];
};

function normalizeId(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function detailsToText(details: readonly string[]) {
  return details.join("\n");
}

function textToDetails(text: string) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function listingToDraft(l: Listing): DraftListing {
  return {
    id: l.id,
    kind: l.kind,
    badge: l.badge,
    title: l.title,
    subtitle: l.subtitle,
    price: l.price,
    locationLabel: l.location?.label ?? "",
    locationLat: l.location ? String(l.location.lat) : "",
    locationLng: l.location ? String(l.location.lng) : "",
    locationRadiusMeters:
      l.location?.radiusMeters != null ? String(l.location.radiusMeters) : "",
    detailsText: detailsToText(l.details),
    description: l.description,
    images: l.images.map((img) => ({ src: img.src, alt: img.alt })),
  };
}

function emptyDraft(): DraftListing {
  return {
    id: "",
    kind: "apartment",
    badge: "Nou",
    title: "",
    subtitle: "",
    price: "",
    locationLabel: "",
    locationLat: "",
    locationLng: "",
    locationRadiusMeters: "",
    detailsText: "",
    description: "",
    images: [{ src: "", alt: "" }],
  };
}

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  });
}

export function AdminOferteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit") ?? "";
  const isNew = searchParams.get("new") === "1";

  const auth = (() => {
    try {
      return getAuthSnapshot();
    } catch {
      return { isAuthed: false, role: "user" as const, email: "" };
    }
  })();

  const isAdmin = auth.isAuthed && auth.role === "admin";
  const {
    listings,
    isLoading: isLoadingListings,
    error: listingsError,
    refetch,
  } = useListingsRemote();

  const [editingOriginalId, setEditingOriginalId] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftListing>(() => emptyDraft());
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const selectedListing = useMemo(() => {
    if (!editId) return null;
    return listings.find((l) => l.id === editId) ?? null;
  }, [editId, listings]);

  useEffect(() => {
    if (isNew) {
      setEditingOriginalId(null);
      setDraft(emptyDraft());
      return;
    }
    if (selectedListing) {
      setEditingOriginalId(selectedListing.id);
      setDraft(listingToDraft(selectedListing));
      return;
    }
    if (editId) {
      setEditingOriginalId(editId);
      setDraft((d) => ({ ...d, id: editId }));
    }
  }, [editId, isNew, selectedListing]);

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="text-sm font-semibold text-slate-900">
            Acces restricționat
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Pagina de administrare este disponibilă doar pentru admin.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ScrollTopLink
              href="/listari"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Înapoi la listări
            </ScrollTopLink>
            <Link
              href="/login?next=/admin/oferte"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = listings.length;

  const handleSave = async () => {
    setError(null);
    setNotice(null);

    const id = normalizeId(draft.id);
    if (!id) {
      setError("ID-ul este obligatoriu (ex: apt-zorilor-3cam).");
      return;
    }

    const title = draft.title.trim();
    if (!title) {
      setError("Titlul este obligatoriu.");
      return;
    }

    const images = draft.images
      .map((img) => ({ src: img.src.trim(), alt: img.alt.trim() }))
      .filter((img) => img.src);

    if (!images.length) {
      setError("Adaugă cel puțin o poză (URL sau upload).");
      return;
    }

    const locLabel = draft.locationLabel.trim();
    const locLatRaw = draft.locationLat.trim();
    const locLngRaw = draft.locationLng.trim();
    const locRadiusRaw = draft.locationRadiusMeters.trim();
    const anyLocField = Boolean(locLabel || locLatRaw || locLngRaw || locRadiusRaw);

    let location: Listing["location"] | undefined = undefined;
    if (anyLocField) {
      const lat = Number(locLatRaw);
      const lng = Number(locLngRaw);
      const radiusMeters = locRadiusRaw ? Number(locRadiusRaw) : undefined;

      if (!locLabel) {
        setError("Completează localitatea (ex: Cluj-Napoca, Zorilor).");
        return;
      }
      if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
        setError("Latitudine invalidă (ex: 46.77).");
        return;
      }
      if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
        setError("Longitudine invalidă (ex: 23.62).");
        return;
      }
      if (radiusMeters !== undefined) {
        if (!Number.isFinite(radiusMeters) || radiusMeters <= 0) {
          setError("Raza trebuie să fie un număr pozitiv (metri).");
          return;
        }
      }

      location = {
        label: locLabel,
        lat,
        lng,
        ...(radiusMeters !== undefined ? { radiusMeters } : null),
      };
    }

    const listing: Listing = {
      id,
      kind: draft.kind,
      badge: draft.badge.trim(),
      title,
      subtitle: draft.subtitle.trim(),
      price: draft.price.trim(),
      details: textToDetails(draft.detailsText),
      description: draft.description.trim(),
      images: images.map((img) => ({
        src: img.src,
        alt: img.alt || title,
      })),
      ...(location ? { location } : null),
    };

    setIsBusy(true);
    try {
      await saveListing(listing);

      // If ID changed, treat it as a "rename": save new, then delete old.
      if (editingOriginalId && editingOriginalId !== id) {
        await deleteListingRemote(editingOriginalId);
      }

      setEditingOriginalId(id);
      setNotice("Salvat în baza de date.");
      refetch();
      router.replace(`/admin/oferte?edit=${encodeURIComponent(id)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "Eroare la salvare.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex flex-col">
            <div className="text-sm font-semibold text-slate-900">
              Admin • Oferte
            </div>
            <div className="text-xs text-slate-500">Total: {total}</div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <ScrollTopLink
              href="/listari"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              Înapoi la listări
            </ScrollTopLink>
            <Link
              href="/admin/oferte?new=1"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              onClick={() => {
                setError(null);
                setNotice(null);
              }}
            >
              + Ofertă nouă
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 shadow-sm hover:bg-rose-100"
              disabled={isBusy}
              onClick={async () => {
                const ok = window.confirm(
                  "Resetezi toate ofertele la valorile inițiale (din cod)?",
                );
                if (!ok) return;
                setIsBusy(true);
                setError(null);
                setNotice(null);
                try {
                  await resetListingsRemote();
                  setNotice("Reset făcut (bază de date).");
                  refetch();
                  router.replace("/admin/oferte");
                } catch (err) {
                  const message = err instanceof Error ? err.message : String(err);
                  setError(message || "Eroare la reset.");
                } finally {
                  setIsBusy(false);
                }
              }}
            >
              Reset la default
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-5">
        <section className="lg:col-span-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900">
                  {editingOriginalId ? "Editează ofertă" : "Creează ofertă"}
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  Modificările se salvează în baza de date și se văd pe listări
                  după refresh.
                </div>
              </div>

              {editingOriginalId ? (
                <button
                  type="button"
                  disabled={isBusy}
                  className="inline-flex items-center justify-center rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-500"
                  onClick={async () => {
                    const ok = window.confirm(
                      `Ștergi oferta (ID: ${editingOriginalId})?`,
                    );
                    if (!ok) return;
                    setIsBusy(true);
                    setError(null);
                    setNotice(null);
                    try {
                      await deleteListingRemote(editingOriginalId);
                      setEditingOriginalId(null);
                      setDraft(emptyDraft());
                      setNotice("Șters din baza de date.");
                      refetch();
                      router.replace("/admin/oferte");
                    } catch (err) {
                      const message = err instanceof Error ? err.message : String(err);
                      setError(message || "Eroare la ștergere.");
                    } finally {
                      setIsBusy(false);
                    }
                  }}
                >
                  Șterge
                </button>
              ) : null}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-slate-900">ID</span>
                <input
                  value={draft.id}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, id: e.target.value }))
                  }
                  placeholder="apt-zorilor-3cam"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
                <span className="text-xs text-slate-500">
                  Va fi normalizat la:{" "}
                  <span className="font-semibold">
                    {draft.id ? normalizeId(draft.id) : "—"}
                  </span>
                </span>
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-slate-900">Tip</span>
                <select
                  value={draft.kind}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      kind: e.target.value as Listing["kind"],
                    }))
                  }
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                >
                  <option value="apartment">Apartament</option>
                  <option value="house">Casă</option>
                  <option value="land">Teren</option>
                </select>
              </label>

              <label className="grid gap-1 text-sm sm:col-span-2">
                <span className="font-semibold text-slate-900">Badge</span>
                <input
                  value={draft.badge}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, badge: e.target.value }))
                  }
                  placeholder="Exclusivitate / Nou / Recomandat"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </label>

              <label className="grid gap-1 text-sm sm:col-span-2">
                <span className="font-semibold text-slate-900">Titlu</span>
                <input
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, title: e.target.value }))
                  }
                  placeholder="Apartament 3 camere • Zorilor"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </label>

              <label className="grid gap-1 text-sm sm:col-span-2">
                <span className="font-semibold text-slate-900">Subtitlu</span>
                <input
                  value={draft.subtitle}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, subtitle: e.target.value }))
                  }
                  placeholder="Terasa, parcare, aproape de UMF"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </label>

              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-slate-900">Preț</span>
                <input
                  value={draft.price}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, price: e.target.value }))
                  }
                  placeholder="189.000 €"
                  className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </label>

              <div className="grid gap-2 text-sm sm:col-span-2">
                <div className="font-semibold text-slate-900">
                  Locație (aproximativă) pentru hartă
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1 text-sm sm:col-span-2">
                    <span className="text-slate-700">Localitate / zonă</span>
                    <input
                      value={draft.locationLabel}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, locationLabel: e.target.value }))
                      }
                      placeholder="Cluj-Napoca, Zorilor"
                      className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                    />
                  </label>

                  <div className="sm:col-span-2">
                    <AdminListingLocationPicker
                      label={draft.locationLabel}
                      lat={draft.locationLat}
                      lng={draft.locationLng}
                      radiusMeters={draft.locationRadiusMeters}
                      onChange={(patch) =>
                        setDraft((d) => ({
                          ...d,
                          ...(patch.lat !== undefined ? { locationLat: patch.lat } : null),
                          ...(patch.lng !== undefined ? { locationLng: patch.lng } : null),
                          ...(patch.radiusMeters !== undefined
                            ? { locationRadiusMeters: patch.radiusMeters }
                            : null),
                        }))
                      }
                    />
                    <div className="mt-3 text-xs text-slate-500">
                      Completează{" "}
                      <span className="font-semibold text-slate-700">
                        Localitate / zonă
                      </span>{" "}
                      + alege pin-ul pe hartă. Dacă lipsește locația, oferta nu va
                      afișa harta pe pagina publică.
                    </div>
                  </div>
                </div>
              </div>

              <label className="grid gap-1 text-sm">
                <span className="font-semibold text-slate-900">
                  Detalii (1 / rând)
                </span>
                <textarea
                  value={draft.detailsText}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, detailsText: e.target.value }))
                  }
                  rows={4}
                  placeholder={"78 m²\n3 camere\n2 băi\nEt. 3/6"}
                  className="min-h-[8rem] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </label>

              <label className="grid gap-1 text-sm sm:col-span-2">
                <span className="font-semibold text-slate-900">Descriere</span>
                <textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, description: e.target.value }))
                  }
                  rows={5}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                />
              </label>
            </div>

            <div className="mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-900">Poze</div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                  onClick={() => {
                    setDraft((d) => ({
                      ...d,
                      images: [...d.images, { src: "", alt: "" }].slice(0, 6),
                    }));
                  }}
                >
                  + poză
                </button>
              </div>

              <div className="mt-4 grid gap-4">
                {draft.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-900">
                        Poză #{idx + 1}
                      </div>
                      <button
                        type="button"
                        className="text-sm font-semibold text-rose-700 hover:text-rose-800"
                        onClick={() => {
                          setDraft((d) => ({
                            ...d,
                            images: d.images.filter((_, i) => i !== idx),
                          }));
                        }}
                      >
                        Șterge
                      </button>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1 text-sm">
                        <span className="text-slate-700">URL / Data URL</span>
                        <input
                          value={img.src}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraft((d) => ({
                              ...d,
                              images: d.images.map((x, i) =>
                                i === idx ? { ...x, src: v } : x,
                              ),
                            }));
                          }}
                          placeholder="https://… sau data:image/…"
                          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                        />
                      </label>

                      <label className="grid gap-1 text-sm">
                        <span className="text-slate-700">Alt text</span>
                        <input
                          value={img.alt}
                          onChange={(e) => {
                            const v = e.target.value;
                            setDraft((d) => ({
                              ...d,
                              images: d.images.map((x, i) =>
                                i === idx ? { ...x, alt: v } : x,
                              ),
                            }));
                          }}
                          placeholder="Ex: Living luminos"
                          className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
                        />
                      </label>

                      <label className="grid gap-1 text-sm sm:col-span-2">
                        <span className="text-slate-700">
                          Upload (se salvează ca data URL)
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const dataUrl = await fileToDataUrl(file);
                            setDraft((d) => ({
                              ...d,
                              images: d.images.map((x, i) =>
                                i === idx
                                  ? {
                                      ...x,
                                      src: dataUrl,
                                      alt: x.alt || file.name,
                                    }
                                  : x,
                              ),
                            }));
                          }}
                        />
                      </label>
                    </div>

                    {img.src ? (
                      <div className="relative mt-3 h-44 overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <Image
                          src={img.src}
                          alt={img.alt || draft.title || "Preview"}
                          fill
                          sizes="(max-width: 640px) 100vw, 400px"
                          className="object-cover"
                          loading="lazy"
                          unoptimized
                        />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            {error ? (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {error}
              </div>
            ) : null}
            {notice ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {notice}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={isBusy}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-sky-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-sky-500"
                onClick={handleSave}
              >
                Salvează
              </button>
              <button
                type="button"
                disabled={isBusy}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                onClick={() => {
                  setError(null);
                  setNotice(null);
                  if (selectedListing) {
                    setEditingOriginalId(selectedListing.id);
                    setDraft(listingToDraft(selectedListing));
                    return;
                  }
                  if (isNew) {
                    setEditingOriginalId(null);
                    setDraft(emptyDraft());
                    return;
                  }
                }}
              >
                Reset formular
              </button>
            </div>
          </div>
        </section>

        <aside className="lg:col-span-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-900">
                Oferte existente
              </div>
              <Link
                href="/admin/oferte"
                className="text-sm font-semibold text-sky-700 hover:text-sky-800"
                onClick={() => {
                  setError(null);
                  setNotice(null);
                }}
              >
                Clear
              </Link>
            </div>

            {isLoadingListings ? (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                Se încarcă ofertele…
              </div>
            ) : null}
            {listingsError ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                {listingsError}
              </div>
            ) : null}

            <div className="mt-4 grid gap-3">
              {listings.map((l) => (
                <div
                  key={l.id}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-900">
                      {l.title}
                    </div>
                    <div className="mt-1 truncate text-xs text-slate-600">
                      ID: {l.id}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/admin/oferte?edit=${encodeURIComponent(l.id)}`}
                      className="inline-flex items-center justify-center rounded-lg bg-white px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
                      onClick={() => {
                        setError(null);
                        setNotice(null);
                      }}
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={isBusy}
                      className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-rose-500"
                      onClick={async () => {
                        const ok = window.confirm(
                          `Ștergi oferta “${l.title}” (ID: ${l.id})?`,
                        );
                        if (!ok) return;
                        setIsBusy(true);
                        setError(null);
                        setNotice(null);
                        try {
                          await deleteListingRemote(l.id);
                          refetch();
                          if (editingOriginalId === l.id) {
                            setEditingOriginalId(null);
                            setDraft(emptyDraft());
                            router.replace("/admin/oferte");
                          }
                          setNotice("Șters din baza de date.");
                        } catch (err) {
                          const message = err instanceof Error ? err.message : String(err);
                          setError(message || "Eroare la ștergere.");
                        } finally {
                          setIsBusy(false);
                        }
                      }}
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

