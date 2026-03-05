"use server";
/**
 * actions/auth.ts — Server Actions for authentication flows.
 *
 * Login / 2FA verification use NextAuth's signIn() so the session is managed
 * entirely by NextAuth (HttpOnly JWT cookie). Tokens never touch the browser.
 *
 * Registration calls the backend directly then signs in with the same
 * credentials so NextAuth builds the session from the fresh token response.
 */

import { signIn, signOut, auth } from "@/lib/auth";
import { AuthError } from "next-auth";
import { revalidateTag } from "next/cache";
import type { UserRole } from "@/lib/bioloTypes";

// ─── Shared result type ───────────────────────────────────────────────────────

export interface ActionResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * Sign in with email + password.
 *
 * On success or 2FA-pending → NextAuth redirects to "/" where middleware
 * sends the user to their dashboard (or /auth/2fa if pending).
 * On failure → returns { ok: false, error }.
 */
export async function loginAction(payload: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirectTo: "/",
    });
    return { ok: true }; // unreachable — signIn throws NEXT_REDIRECT on success
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, error: "Email ou password incorrectos" };
    }
    throw e; // re-throw NEXT_REDIRECT so Next.js can handle it
  }
}

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * Create a new account then sign in immediately.
 *
 * The backend's /auth/register returns tokens directly (same shape as login),
 * but we sign in afterwards so NextAuth owns the session lifecycle.
 */
export async function registerAction(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phoneNumber?: string;
}): Promise<ActionResult> {
  // Step 1: create the account
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        role: payload.role.toUpperCase(), // backend expects "CLIENT" | "WORKER"
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const message: string =
        (err as { message?: string }).message ?? "Erro ao criar conta";
      return { ok: false, error: message };
    }
  } catch {
    return { ok: false, error: "Erro ao criar conta" };
  }

  // Step 2: sign in with the same credentials
  try {
    await signIn("credentials", {
      email: payload.email,
      password: payload.password,
      redirectTo: "/",
    });
    return { ok: true }; // unreachable
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, error: "Conta criada, mas falhou ao entrar automaticamente" };
    }
    throw e; // NEXT_REDIRECT
  }
}

// ─── 2FA — Verify code after login ───────────────────────────────────────────

/**
 * Complete the 2FA step.
 * The twoFactorToken comes from the pending NextAuth session.
 * On success → NextAuth redirects to "/" → middleware sends to dashboard.
 */
export async function verify2faAction(
  twoFactorToken: string,
  code: string
): Promise<ActionResult> {
  try {
    await signIn("credentials", {
      twoFactorToken,
      code, // field name that matches the backend DTO
      redirectTo: "/",
    });
    return { ok: true }; // unreachable
  } catch (e) {
    if (e instanceof AuthError) {
      return { ok: false, error: "Código inválido ou expirado" };
    }
    throw e; // NEXT_REDIRECT
  }
}

// ─── 2FA setup — initiate (returns QR code URL + secret) ─────────────────────

export async function setup2faAction(): Promise<
  ActionResult<{ qrCodeUrl: string; secret: string; backupCodes: string[] }>
> {
  try {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/auth/2fa/setup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.accessToken}`,
      },
      cache: "no-store",
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message);
    const data = await res.json();
    return { ok: true, data };
  } catch (e: unknown) {
    return { ok: false, error: (e as Error).message ?? "Erro ao iniciar 2FA" };
  }
}

// ─── 2FA setup — confirm first OTP from authenticator app ─────────────────────

export async function confirm2faSetupAction(
  otp: string
): Promise<ActionResult<{ backupCodes: string[] }>> {
  try {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/auth/2fa/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.accessToken}`,
      },
      body: JSON.stringify({ otp }),
      cache: "no-store",
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message);
    const data: { backupCodes: string[] } = await res.json();
    revalidateTag("session");
    return { ok: true, data: { backupCodes: data.backupCodes } };
  } catch (e: unknown) {
    return { ok: false, error: (e as Error).message ?? "Código inválido" };
  }
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  // Best-effort: tell the backend to invalidate the refresh token
  try {
    const session = await auth();
    if (session?.accessToken) {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
        cache: "no-store",
      });
    }
  } catch {
    // non-critical — session will be cleared regardless
  }

  revalidateTag("session");
  await signOut({ redirectTo: "/" });
}
