import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import AuthScreen from "@/components/biolo/screens/AuthScreen";

type Role = "client" | "worker" | "admin";
const VALID_ROLES: Role[] = ["client", "worker", "admin"];

export default async function AuthPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  const session = await getSession();
  if (session) redirect("/");

  const validRole = VALID_ROLES.includes(role as Role) ? (role as Role) : "client";
  return <AuthScreen mode={validRole} />;
}
