/**
 * middleware.ts
 * Edge middleware powered by NextAuth v5.
 *
 * Responsibilities:
 *  1. If session error (refresh token expired) → redirect to login.
 *  2. If session has twoFactorPending → redirect to /auth/2fa.
 *  3. Protected routes without a valid session → redirect to login.
 *  4. Authenticated users on auth pages → redirect to their dashboard.
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/client", "/worker", "/admin"];
const AUTH_PREFIXES = ["/auth"];

const ROLE_DASHBOARDS: Record<string, string> = {
  client: "/client/dashboard",
  worker: "/worker/dashboard",
  admin: "/admin",
};

export default auth(function middleware(req: NextRequest & { auth: Awaited<ReturnType<typeof auth>> }) {
  const { pathname } = req.nextUrl;
  const session = (req as any).auth;

  // 1. Refresh token expired — force re-login
  if (session?.error === "RefreshAccessTokenError") {
    return NextResponse.redirect(new URL("/auth/client", req.url));
  }

  // 2. 2FA pending — only allow /auth/2fa
  if (session?.user?.twoFactorPending && !pathname.startsWith("/auth/2fa")) {
    return NextResponse.redirect(new URL("/auth/2fa", req.url));
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PREFIXES.some((p) => pathname.startsWith(p));
  const isFullyAuthenticated = session?.user?.id && !session.user.twoFactorPending;

  // 3. Protected route without a valid session
  if (isProtected && !isFullyAuthenticated) {
    return NextResponse.redirect(new URL("/auth/client", req.url));
  }

  // 4. Authenticated user on an auth page → send to their dashboard
  if (isAuthPage && isFullyAuthenticated) {
    const role = session!.user.role ?? "client";
    const dest = ROLE_DASHBOARDS[role] ?? "/";
    return NextResponse.redirect(new URL(dest, req.url));
  }

  return NextResponse.next();
});

export const config = {
  // Run on all routes except Next.js internals and static assets
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
