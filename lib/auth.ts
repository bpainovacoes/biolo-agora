/**
 * lib/auth.ts
 * NextAuth v5 configuration.
 *
 * Two-step Credentials flow:
 *   Step 1 — email + password  → POST /auth/login
 *     · normal login  → full TokenResponse, session ready
 *     · 2FA required  → twoFactorPending session (redirects to /auth/2fa)
 *   Step 2 — twoFactorToken + code → POST /auth/2fa/verify
 *     → full TokenResponse, session upgraded
 *
 * Access-token refresh is automatic inside the jwt() callback.
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { UserRole } from "./bioloTypes";

// ─── Backend response shapes ──────────────────────────────────────────────────

interface BackendTokenResponse {
  accessToken: string;
  refreshToken: string;
  /** seconds until access token expires */
  expiresIn: number;
  user: {
    sub: string;
    email: string;
    /** Prisma enum: "CLIENT" | "WORKER" | "ADMIN" */
    role: string;
    twoFactorEnabled: boolean;
    twoFactorVerified: boolean;
  };
}


// ─── Helpers ──────────────────────────────────────────────────────────────────

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

async function backendPost(path: string, body: unknown): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
}

/**
 * The backend wraps every response in a global interceptor envelope:
 *   { statusCode: 200, message: "Success", data: <payload>, timestamp: "..." }
 *
 * This helper unwraps it, returning the inner `data` when the envelope is
 * present, or the object as-is when it's already the raw payload.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrap(json: any): any {
  if (json && typeof json === "object" && "data" in json && "statusCode" in json) {
    return json.data;
  }
  return json;
}

/** Converts backend uppercase role to frontend lowercase. */
function normalizeRole(role: string): UserRole {
  return role.toLowerCase() as UserRole;
}

// ─── NextAuth config ──────────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        twoFactorToken: {},
        code: {},
      },

    

      async authorize(credentials) {

    
        // ── Step 2: 2FA code verification ────────────────────────────────────
        if (credentials.twoFactorToken && credentials.code) {
          const res = await backendPost("/auth/2fa/verify", {
            twoFactorToken: credentials.twoFactorToken,
            code: credentials.code,
          });

          if (!res.ok) return null;
          const data: BackendTokenResponse = unwrap(await res.json());
          if (!data?.user?.sub) return null;

          return {
            id: data.user.sub,
            email: data.user.email,
            role: normalizeRole(data.user.role),
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            accessTokenExpires: Date.now() + data.expiresIn * 1000,
            twoFactorEnabled: data.user.twoFactorEnabled ?? false,
            twoFactorVerified: true,
            twoFactorPending: false,
          };
        }

        // ── Step 1: email + password ─────────────────────────────────────────
        if (!credentials.email || !credentials.password) return null;

        const res = await backendPost("/auth/login", {
          email: credentials.email,
          password: credentials.password,
        });

        if (!res.ok) return null;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload = unwrap(await res.json()) as any;

        // 2FA required — return a "pending" user object
        if (payload?.requires2fa && payload?.twoFactorToken) {
          return {
            id: "__2fa_pending__",
            email: credentials.email as string,
            role: null,
            accessToken: null,
            refreshToken: null,
            accessTokenExpires: 0,
            twoFactorEnabled: true,
            twoFactorVerified: false,
            twoFactorPending: true,
            twoFactorToken: payload.twoFactorToken as string,
          };
        }

        // Normal login
        const tokenData = payload as BackendTokenResponse;
        if (!tokenData?.user?.sub) return null;
        console.log(tokenData)
        return {
          id: tokenData.user.sub,
          email: tokenData.user.email,
          role: normalizeRole(tokenData.user.role),
          accessToken: tokenData.accessToken,
          refreshToken: tokenData.refreshToken,
          accessTokenExpires: Date.now() + tokenData.expiresIn * 1000,
          twoFactorEnabled: tokenData.user.twoFactorEnabled ?? false,
          twoFactorVerified: tokenData.user.twoFactorVerified ?? false,
          twoFactorPending: false,
        };
      },
    }),
  ],

  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user }: any) {
      // Initial sign-in: persist user data into the JWT
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: user.accessTokenExpires ?? 0,
          twoFactorEnabled: user.twoFactorEnabled ?? false,
          twoFactorVerified: user.twoFactorVerified ?? false,
          twoFactorPending: user.twoFactorPending ?? false,
          twoFactorToken: user.twoFactorToken,
          error: undefined,
        };
      }

      // 2FA still pending — no access token to refresh
      if (token.twoFactorPending) return token;

      // Access token still valid (with 60s buffer)
      if (Date.now() < (token.accessTokenExpires as number) - 60_000) {
        return token;
      }

      // Refresh the access token
      try {
        const res = await backendPost("/auth/refresh", {
          refreshToken: token.refreshToken,
        });

        if (!res.ok) throw new Error("Refresh failed");
        const refreshed: BackendTokenResponse = unwrap(await res.json());

        return {
          ...token,
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          accessTokenExpires: Date.now() + refreshed.expiresIn * 1000,
          error: undefined,
        };
      } catch {
        return { ...token, error: "RefreshAccessTokenError" as const };
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token }: any) {
      session.user.id = token.id as string;
      session.user.role = token.role as UserRole | null;
      session.user.twoFactorEnabled = (token.twoFactorEnabled as boolean) ?? false;
      session.user.twoFactorVerified = (token.twoFactorVerified as boolean) ?? false;
      session.user.twoFactorPending = (token.twoFactorPending as boolean) ?? false;
      session.user.twoFactorToken = token.twoFactorToken as string | undefined;
      session.accessToken = (token.accessToken as string) ?? null;
      session.error = token.error as string | undefined;
      return session;
    },
  },

  pages: {
    signIn: "/auth/client",
    error: "/auth/client",
  },

  session: { strategy: "jwt" },
});
