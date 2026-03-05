/**
 * lib/api.ts
 * Centralised HTTP client for the Biolo backend.
 *
 * Features:
 *  - Reads the access token from the NextAuth session (Server Components / Actions)
 *  - Attaches Authorization: Bearer <accessToken> automatically
 *  - On 401: redirects to login (token refresh is handled by NextAuth's jwt callback)
 *  - Every request accepts Next.js `tags` for cache invalidation via revalidateTag()
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

// ─── Token helper ─────────────────────────────────────────────────────────────

/**
 * Returns the current access token from the NextAuth session.
 * Works in Server Components, Route Handlers, and Server Actions.
 */
export async function getAccessToken(): Promise<string | undefined> {
  const session = await auth();
  return session?.accessToken ?? undefined;
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Next.js cache tags for revalidation */
  tags?: string[];
  /** Next.js revalidation time in seconds (default: no cache for mutations) */
  revalidate?: number | false;
  /** Skip auth header (used for login / register) */
  public?: boolean;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { body, tags, revalidate, public: isPublic, ...init } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  if (!isPublic) {
    const token = await getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  // Build Next.js fetch options for caching / revalidation
  const nextOptions: RequestInit["next"] = {};
  if (tags) nextOptions.tags = tags;
  if (revalidate !== undefined) nextOptions.revalidate = revalidate;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    next: Object.keys(nextOptions).length ? nextOptions : undefined,
    cache: revalidate !== undefined || tags ? undefined : "no-store",
  });

  // 401 → session is no longer valid; redirect to login
  // (NextAuth refreshes the access token automatically in the jwt callback,
  //  so a 401 here means the refresh token is also expired)
  if (res.status === 401 && !isPublic) {
    redirect("/auth/client");
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      message = err.message ?? err.error ?? message;
    } catch {
      // ignore parse errors
    }
    throw { status: res.status, message } satisfies ApiError;
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "GET", ...opts }),

  post: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "POST", body, ...opts }),

  patch: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "PATCH", body, ...opts }),

  put: <T>(path: string, body?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "PUT", body, ...opts }),

  delete: <T>(path: string, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "DELETE", ...opts }),
};
