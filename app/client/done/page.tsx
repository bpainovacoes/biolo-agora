import { requireRole } from "@/lib/session";
import DoneScreen from "@/components/biolo/client/DoneScreen";

export default async function ClientDonePage() {
  await requireRole("client");
  return <DoneScreen />;
}
