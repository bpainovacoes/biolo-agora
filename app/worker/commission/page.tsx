import { requireRole } from "@/lib/session";
import WorkerCommissionScreen from "@/components/biolo/worker/WorkerCommissionScreen";

export default async function WorkerCommissionPage() {
  await requireRole("worker");
  return <WorkerCommissionScreen />;
}
