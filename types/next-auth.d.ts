import type { UserRole } from "@/lib/bioloTypes";

declare module "next-auth" {
  interface Session {
    /** Backend access token — attach as Bearer header for API calls. */
    accessToken: string | null;
    /** Set to "RefreshAccessTokenError" if silent refresh failed. */
    error?: string;
    user: {
      id: string;
      email: string;
      /** null when twoFactorPending (role not yet confirmed by 2FA). */
      role: UserRole | null;
      twoFactorEnabled: boolean;
      twoFactorVerified: boolean;
      /** true after step-1 login when 2FA is required. */
      twoFactorPending: boolean;
      /** Short-lived JWT for step-2 2FA verification. */
      twoFactorToken?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole | null;
    accessToken: string | null;
    refreshToken: string | null;
    accessTokenExpires: number;
    twoFactorEnabled: boolean;
    twoFactorVerified: boolean;
    twoFactorPending: boolean;
    twoFactorToken?: string;
    error?: string;
  }
}
