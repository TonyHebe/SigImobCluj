import crypto from "node:crypto";

type PasswordHash = {
  scheme: "scrypt";
  saltHex: string;
  hashHex: string;
};

function toHex(buf: Uint8Array) {
  return Buffer.from(buf).toString("hex");
}

function fromHex(hex: string) {
  return new Uint8Array(Buffer.from(hex, "hex"));
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const keylen = 64;

  const derivedKey = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, (err, key) => {
      if (err) reject(err);
      else resolve(key as Buffer);
    });
  });

  const parsed: PasswordHash = {
    scheme: "scrypt",
    saltHex: toHex(salt),
    hashHex: derivedKey.toString("hex"),
  };

  // Format: scrypt:<saltHex>:<hashHex>
  return `${parsed.scheme}:${parsed.saltHex}:${parsed.hashHex}`;
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;

  const salt = Buffer.from(fromHex(saltHex));
  const expected = Buffer.from(fromHex(hashHex));
  const keylen = expected.length;

  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, (err, key) => {
      if (err) reject(err);
      else resolve(key as Buffer);
    });
  });

  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

