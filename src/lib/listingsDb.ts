import type { Collection } from "mongodb";

import type { Listing } from "@/lib/listings";
import { featuredListings } from "@/lib/listings";
import { getMongoClientPromise } from "@/lib/mongodb";

type ListingDoc = Listing & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

function getDbName(): string | undefined {
  const raw = process.env.MONGODB_DB;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

async function getListingsCollection(): Promise<Collection<ListingDoc>> {
  const client = await getMongoClientPromise();
  const dbName = getDbName();
  const db = dbName ? client.db(dbName) : client.db();
  return db.collection<ListingDoc>("listings");
}

function withDefaultLocationFallback(listing: Listing): Listing {
  // Backward-compat: older DB documents may predate `Listing.location`.
  // For the built-in demo listings, infer location from `featuredListings`
  // so offer detail pages can show the "Localitate" map without requiring a reset.
  if (listing.location) return listing;
  const fallback = featuredListings.find((l) => l.id === listing.id)?.location;
  return fallback ? { ...listing, location: fallback } : listing;
}

function docToListing(doc: ListingDoc): Listing {
  // Ensure `id` is always consistent with `_id`.
  const { _id, ...rest } = doc;
  return withDefaultLocationFallback({ ...rest, id: _id });
}

async function seedListingsIfEmpty() {
  const col = await getListingsCollection();

  // Fast existence check (avoid full count scan).
  const existing = await col.findOne({}, { projection: { _id: 1 } });
  if (existing) return;

  // Preserve the current default ordering from `featuredListings` by
  // giving earlier entries a slightly newer updatedAt.
  const base = Date.now();
  const docs: ListingDoc[] = featuredListings.map((l, idx) => ({
    _id: l.id,
    ...l,
    createdAt: new Date(base - idx),
    updatedAt: new Date(base - idx),
  }));

  try {
    if (docs.length) await col.insertMany(docs, { ordered: true });
  } catch (err) {
    // If two requests race to seed, one may hit duplicate key errors.
    // In that case, it's safe to ignore and proceed.
    const anyErr = err as { code?: number };
    if (anyErr?.code !== 11000) throw err;
  }
}

export async function getAllListings(): Promise<Listing[]> {
  await seedListingsIfEmpty();
  const col = await getListingsCollection();
  const docs = await col.find({}).sort({ updatedAt: -1, _id: 1 }).toArray();
  return docs.map(docToListing);
}

export async function getListingById(id: string): Promise<Listing | null> {
  await seedListingsIfEmpty();
  const col = await getListingsCollection();
  const doc = await col.findOne({ _id: id });
  return doc ? docToListing(doc) : null;
}

export async function upsertListing(listing: Listing): Promise<Listing> {
  await seedListingsIfEmpty();
  const col = await getListingsCollection();

  const now = new Date();
  await col.updateOne(
    { _id: listing.id },
    {
      $set: {
        ...listing,
        _id: listing.id,
        updatedAt: now,
      },
      $setOnInsert: {
        createdAt: now,
      },
    },
    { upsert: true },
  );

  return listing;
}

export async function deleteListingById(id: string): Promise<boolean> {
  const col = await getListingsCollection();
  const res = await col.deleteOne({ _id: id });
  return res.deletedCount === 1;
}

export async function resetListingsToDefaults(): Promise<number> {
  const col = await getListingsCollection();
  await col.deleteMany({});

  const base = Date.now();
  const docs: ListingDoc[] = featuredListings.map((l, idx) => ({
    _id: l.id,
    ...l,
    createdAt: new Date(base - idx),
    updatedAt: new Date(base - idx),
  }));

  if (!docs.length) return 0;
  const res = await col.insertMany(docs, { ordered: true });
  return res.insertedCount;
}

