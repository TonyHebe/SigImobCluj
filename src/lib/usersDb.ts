import type { Collection } from "mongodb";

import { getMongoClientPromise } from "@/lib/mongodb";

export type UserDoc = {
  _id: string; // normalized email (unique)
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getDbName(): string | undefined {
  const raw = process.env.MONGODB_DB;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

async function getUsersCollection(): Promise<Collection<UserDoc>> {
  const client = await getMongoClientPromise();
  const dbName = getDbName();
  const db = dbName ? client.db(dbName) : client.db();
  const col = db.collection<UserDoc>("users");

  // Ensure unique email (best-effort).
  // If multiple requests race to create the index, Mongo will handle it.
  await col.createIndex({ _id: 1 }, { unique: true });

  return col;
}

export async function getUserByEmail(email: string): Promise<UserDoc | null> {
  const col = await getUsersCollection();
  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return col.findOne({ _id: normalized });
}

export async function createUser(params: {
  email: string;
  passwordHash: string;
}): Promise<"created" | "exists"> {
  const col = await getUsersCollection();
  const email = normalizeEmail(params.email);
  const now = new Date();

  try {
    await col.insertOne({
      _id: email,
      email,
      passwordHash: params.passwordHash,
      createdAt: now,
      updatedAt: now,
    });
    return "created";
  } catch (err) {
    const anyErr = err as { code?: number };
    if (anyErr?.code === 11000) return "exists";
    throw err;
  }
}

