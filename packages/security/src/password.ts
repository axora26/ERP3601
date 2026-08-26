import { randomBytes, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from "node:crypto";

const VERSION = "scrypt1";
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const SCRYPT_OPTIONS: ScryptOptions = { N: 16384, r: 8, p: 1 };

function scrypt(password: string, salt: Buffer, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keylen, SCRYPT_OPTIONS, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });
}

/**
 * Serialized format: scrypt1$<saltHex>$<hashHex>
 * Versioned so a future parameter change can coexist with old hashes.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = await scrypt(plainPassword, salt, KEY_LENGTH);
  return `${VERSION}$${salt.toString("hex")}$${derivedKey.toString("hex")}`;
}

export async function verifyPassword(plainPassword: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== VERSION) {
    return false;
  }
  const [, saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex as string, "hex");
  const expected = Buffer.from(hashHex as string, "hex");
  const derivedKey = await scrypt(plainPassword, salt, expected.length);
  if (derivedKey.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(derivedKey, expected);
}
