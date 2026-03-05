import { requireSession } from "@/lib/session";
import TwoFactorSetupScreen from "@/components/biolo/screens/TwoFactorSetupScreen";

export default async function TwoFactorSetupPage() {
  const session = await requireSession();
  return <TwoFactorSetupScreen session={session} />;
}
