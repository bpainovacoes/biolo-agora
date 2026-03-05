/**
 * components/RouteGuard.tsx
 * Server Component — reads session from JWT cookie and redirects if needed.
 * 
 * Usage in page.tsx files:
 *   import { requireRole } from "@/lib/session";
 *   const session = await requireRole("client");
 * 
 * This file is a thin wrapper for cases where you want to wrap a client tree.
 * For most pages, call requireRole() directly at the top of the page component.
 */

import { requireRole } from "@/lib/session";
import type { UserRole } from "@/lib/bioloTypes";

interface Props {
  role: UserRole;
  children: React.ReactNode;
}

export default async function RouteGuard({ role, children }: Props) {
  await requireRole(role);
  return <>{children}</>;
}
