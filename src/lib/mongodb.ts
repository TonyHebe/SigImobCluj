import { MongoClient } from "mongodb";

declare global {
  var __mongoClientPromise: Promise<MongoClient> | undefined;
}

export function getMongoClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri || !uri.trim()) {
    throw new Error(
      "Missing MONGODB_URI. Set it in .env.local (local) or Vercel env vars.",
    );
  }

  // Cache the connection across hot reloads in dev.
  if (globalThis.__mongoClientPromise) return globalThis.__mongoClientPromise;

  const client = new MongoClient(uri);
  const promise = client.connect();

  if (process.env.NODE_ENV !== "production") {
    globalThis.__mongoClientPromise = promise;
  }

  return promise;
}

