import { requireRole } from "@/lib/session";
import { getMe } from "@/lib/queries";
import AvailableScreen from "@/components/biolo/worker/AvailableScreen";

export default async function WorkerAvailablePage() {
  await requireRole("worker");
  const user = await getMe();
  return <AvailableScreen user={user} />;
}
