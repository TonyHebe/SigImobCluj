import type { Collection, Db } from "mongodb";

import type { Listing } from "@/lib/listings";
import { featuredListings } from "@/lib/listings";
import { getMongoClientPromise } from "@/lib/mongodb";

type ListingDoc = {
  _id: string; // listing id/slug
  kind: Listing["kind"];
  badge: string;
  title: string;
  subtitle: string;
  price: string;
  details: string[];
  description: string;
  images: { src: string; alt: string }[];
  createdAt: Date;
  updatedAt: Date;
};

function toListing(doc: ListingDoc): Listing {
  return {
    id: doc._id,
    kind: doc.kind,
    badge: doc.badge,
    title: doc.title,
    subtitle: doc.subtitle,
    price: doc.price,
    details: doc.details,
    description: doc.description,
    images: doc.images,
  };
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => isNonEmptyString(x));
}

function isListingKind(v: unknown): v is Listing["kind"] {
  return v === "apartment" || v === "house" || v === "land";
}

function isImagesArray(
  v: unknown,
): v is { src: string; alt: string }[] {
  if (!Array.isArray(v) || v.length < 1) return false;
  return v.every((img) => {
    if (!img || typeof img !== "object") return false;
    const rec = img as Record<string, unknown>;
    return isNonEmptyString(rec.src) && typeof rec.alt === "string";
  });
}

export function parseListing(input: unknown): Listing {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid listing payload.");
  }
  const v = input as Record<string, unknown>;

  if (!isNonEmptyString(v.id)) throw new Error("Missing listing id.");
  if (!isListingKind(v.kind)) throw new Error("Invalid listing kind.");
  if (typeof v.badge !== "string") throw new Error("Invalid listing badge.");
  if (!isNonEmptyString(v.title)) throw new Error("Missing listing title.");
  if (typeof v.subtitle !== "string") throw new Error("Invalid listing subtitle.");
  if (typeof v.price !== "string") throw new Error("Invalid listing price.");
  if (!isStringArray(v.details)) throw new Error("Invalid listing details.");
  if (typeof v.description !== "string") throw new Error("Invalid listing description.");
  if (!isImagesArray(v.images)) throw new Error("Invalid listing images.");

  return {
    id: v.id.trim(),
    kind: v.kind,
    badge: v.badge.trim(),
    title: v.title.trim(),
    subtitle: v.subtitle.trim(),
    price: v.price.trim(),
    details: v.details.map((d) => d.trim()).filter(Boolean),
    description: v.description.trim(),
    images: v.images.map((img) => ({
      src: img.src.trim(),
      alt: String(img.alt ?? "").trim(),
    })),
  };
}

async function getDb(): Promise<Db> {
  const client = await getMongoClientPromise();
  return client.db();
}

async function getCollection(db?: Db): Promise<Collection<ListingDoc>> {
  const database = db ?? (await getDb());
  return database.collection<ListingDoc>("listings");
}

export async function ensureListingsSeededIfEmpty(): Promise<void> {
  const db = await getDb();
  const col = await getCollection(db);

  const any = await col.findOne({}, { projection: { _id: 1 } });
  if (any) return;

  const now = new Date();
  await col.insertMany(
    featuredListings.map((l) => ({
      _id: l.id,
      kind: l.kind,
      badge: l.badge,
      title: l.title,
      subtitle: l.subtitle,
      price: l.price,
      details: [...l.details],
      description: l.description,
      images: l.images.map((img) => ({ src: img.src, alt: img.alt })),
      createdAt: now,
      updatedAt: now,
    })),
    { ordered: false },
  );
}

export async function listListings(): Promise<Listing[]> {
  const db = await getDb();
  const col = await getCollection(db);

  const docs = await col
    .find({}, { sort: { updatedAt: -1 } })
    .toArray();
  return docs.map(toListing);
}

export async function getListing(id: string): Promise<Listing | null> {
  const db = await getDb();
  const col = await getCollection(db);

  const doc = await col.findOne({ _id: id });
  return doc ? toListing(doc) : null;
}

export async function upsertListingDb(listing: Listing): Promise<void> {
  const db = await getDb();
  const col = await getCollection(db);

  const now = new Date();
  await col.updateOne(
    { _id: listing.id },
    {
      $set: {
        kind: listing.kind,
        badge: listing.badge,
        title: listing.title,
        subtitle: listing.subtitle,
        price: listing.price,
        details: [...listing.details],
        description: listing.description,
        images: listing.images.map((img) => ({ src: img.src, alt: img.alt })),
        updatedAt: now,
      },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );
}

export async function deleteListingDb(id: string): Promise<boolean> {
  const db = await getDb();
  const col = await getCollection(db);

  const res = await col.deleteOne({ _id: id });
  return (res.deletedCount ?? 0) > 0;
}

export async function resetListingsDb(): Promise<void> {
  const db = await getDb();
  const col = await getCollection(db);
  await col.deleteMany({});
  await ensureListingsSeededIfEmpty();
}

