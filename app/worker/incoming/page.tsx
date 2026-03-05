import { requireRole } from "@/lib/session";
import { getActiveRequest } from "@/lib/queries";
import { redirect } from "next/navigation";
import IncomingRequestScreen from "@/components/biolo/worker/IncomingRequestScreen";

export default async function WorkerIncomingPage() {
  await requireRole("worker");
  const request = await getActiveRequest();
  if (!request) redirect("/worker/available");
  return <IncomingRequestScreen request={request!} />;
}
