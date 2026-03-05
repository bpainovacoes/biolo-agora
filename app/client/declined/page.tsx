import { requireRole } from "@/lib/session";
import DeclinedScreen from "@/components/biolo/client/DeclinedScreen";

export default async function ClientDeclinedPage() {
  await requireRole("client");
  return <DeclinedScreen />;
}
