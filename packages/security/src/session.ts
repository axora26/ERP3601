import { randomBytes, createHash } from "node:crypto";

/**
 * The raw token is what goes in the HttpOnly cookie; only its SHA-256
 * hash is ever persisted, so a database read alone can never yield a
 * usable session credential.
 */
export function generateSessionToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  return { token, tokenHash };
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
