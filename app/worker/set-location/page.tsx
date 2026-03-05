import { requireRole } from "@/lib/session";
import SetLocationScreen from "@/components/biolo/worker/SetLocationScreen";

export default async function WorkerSetLocationPage() {
  await requireRole("worker");
  return <SetLocationScreen />;
}
