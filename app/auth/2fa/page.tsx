import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TwoFactorVerifyScreen from "@/components/biolo/screens/TwoFactorVerifyScreen";

export default async function TwoFactorPage() {
  const session = await auth();

  // No session at all → send to login
  if (!session?.user) redirect("/");

  // Already fully verified → send to dashboard
  if (!session.user.twoFactorPending) redirect("/");

  return <TwoFactorVerifyScreen twoFactorToken={session.user.twoFactorToken!} />;
}
