import { requireRole } from "@/lib/session";
import { getMe } from "@/lib/queries";
import WorkerDashboardHome from "@/components/biolo/worker/WorkerDashboardHome";

export default async function WorkerDashboardPage() {
  await requireRole("worker");
  const user = await getMe();
  return <WorkerDashboardHome user={user} />;
}
