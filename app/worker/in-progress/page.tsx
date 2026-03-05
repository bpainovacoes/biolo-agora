import { requireRole } from "@/lib/session";
import { getActiveRequest } from "@/lib/queries";
import { redirect } from "next/navigation";
import WorkerInProgressScreen from "@/components/biolo/worker/WorkerInProgressScreen";

export default async function WorkerInProgressPage() {
  await requireRole("worker");
  const request = await getActiveRequest();
  if (!request) redirect("/worker/available");
  return <WorkerInProgressScreen request={request!} />;
}
