import { requireRole } from "@/lib/session";
import WorkerFinalizeScreen from "@/components/biolo/worker/WorkerFinalizeScreen";

export default async function WorkerFinalizePage() {
  await requireRole("worker");
  return <WorkerFinalizeScreen />;
}
