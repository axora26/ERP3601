import { cookies, headers } from "next/headers";
import type { SessionContextDto } from "@axora/types";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:4000";

/**
 * Server-side fetch helper: forwards the browser's session cookie to the
 * NestJS API directly (bypassing the Next.js rewrite, which only exists
 * for browser-originated fetches) so React Server Components can read
 * tenant-scoped data without ever handling the raw session token
 * themselves.
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<{ status: number; body: T | null }> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();
  const incomingHeaders = await headers();

  const response = await fetch(`${API_INTERNAL_URL}/api/v1${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      cookie: cookieHeader,
      "user-agent": incomingHeaders.get("user-agent") ?? "axora-web",
      "content-type": "application/json",
    },
    cache: "no-store",
  });

  if (response.status === 204) {
    return { status: response.status, body: null };
  }

  const text = await response.text();
  const body = text ? (JSON.parse(text) as T) : null;
  return { status: response.status, body };
}

export async function getSessionContext(): Promise<SessionContextDto | null> {
  const { status, body } = await apiFetch<SessionContextDto>("/auth/me");
  if (status !== 200) {
    return null;
  }
  return body;
}
