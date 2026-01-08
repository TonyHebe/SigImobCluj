import type { Collection } from "mongodb";

import type { Listing } from "@/lib/listings";
import { featuredListings } from "@/lib/listings";
import { getMongoClientPromise } from "@/lib/mongodb";

type ListingDoc = Listing & {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
};

function hasMongoConfig() {
  const uri = process.env.MONGODB_URI;
  return Boolean(uri && uri.trim());
}

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

function docToListing(doc: ListingDoc): Listing {
  // Ensure `id` is always consistent with `_id`.
  const { _id, ...rest } = doc;
  return { ...rest, id: _id };
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
  // If MongoDB isn't configured (common in simple deployments), fall back to
  // the static listings so public pages still work.
  if (!hasMongoConfig()) return [...featuredListings];
  await seedListingsIfEmpty();
  const col = await getListingsCollection();
  const docs = await col.find({}).sort({ updatedAt: -1, _id: 1 }).toArray();
  return docs.map(docToListing);
}

export async function getListingById(id: string): Promise<Listing | null> {
  if (!hasMongoConfig()) {
    return featuredListings.find((l) => l.id === id) ?? null;
  }
  await seedListingsIfEmpty();
  const col = await getListingsCollection();
  const doc = await col.findOne({ _id: id });
  return doc ? docToListing(doc) : null;
}

export async function upsertListing(listing: Listing): Promise<Listing> {
  if (!hasMongoConfig()) {
    throw new Error(
      "MongoDB is not configured (missing MONGODB_URI). Admin edits require a database.",
    );
  }
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
  if (!hasMongoConfig()) {
    throw new Error(
      "MongoDB is not configured (missing MONGODB_URI). Admin deletes require a database.",
    );
  }
  const col = await getListingsCollection();
  const res = await col.deleteOne({ _id: id });
  return res.deletedCount === 1;
}

export async function resetListingsToDefaults(): Promise<number> {
  if (!hasMongoConfig()) {
    throw new Error(
      "MongoDB is not configured (missing MONGODB_URI). Reset requires a database.",
    );
  }
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

