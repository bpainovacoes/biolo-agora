/**
 * lib/session.ts
 * Thin session helpers built on top of NextAuth's auth() function.
 *
 * These are drop-in replacements for the old cookie-based helpers:
 *   getSession()     → returns the current user or null
 *   requireSession() → redirects to login if not authenticated
 *   requireRole()    → redirects if role doesn't match
 *
 * Note: 2FA gating is handled by middleware.ts, so requireRole() no longer
 * needs to check twoFactorPending — the request never reaches here if pending.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "./bioloTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorVerified: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the current authenticated user, or null if not logged in / 2FA pending.
 */
export async function getSession(): Promise<SessionUser | null> {
  const session = await auth();

  if (!session?.user?.id || session.user.twoFactorPending) return null;

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role!,
    twoFactorEnabled: session.user.twoFactorEnabled,
    twoFactorVerified: session.user.twoFactorVerified,
  };
}

/**
 * Like getSession() but redirects to `redirectTo` if not authenticated.
 * Use at the top of protected Server Components.
 */
export async function requireSession(
  redirectTo = "/"
): Promise<SessionUser> {
  const session = await getSession();

  if (!session) redirect(redirectTo);
  return session;
}

/**
 * Like requireSession() but also checks the role.
 */
export async function requireRole(
  role: UserRole,
  redirectTo = "/"
): Promise<SessionUser> {
  console.log("Aqui estou aonde")
  const session = await requireSession(redirectTo);
  if (session.role !== role) redirect(redirectTo);
  return session;
}
