import { requireRole } from "@/lib/session";
import { getWorkerHistory } from "@/lib/queries";
import WorkerHistoryScreen from "@/components/biolo/worker/WorkerHistoryScreen";

export default async function WorkerHistoryPage() {
  await requireRole("worker");
  const history = await getWorkerHistory();
  return <WorkerHistoryScreen history={history} />;
}
