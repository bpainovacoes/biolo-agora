import { requireRole } from "@/lib/session";
import { getActiveRequest } from "@/lib/queries";
import { redirect } from "next/navigation";
import InProgressScreen from "@/components/biolo/client/InProgressScreen";

export default async function ClientInProgressPage() {
  await requireRole("client");
  const request = await getActiveRequest();
  if (!request) redirect("/client/dashboard");
  return <InProgressScreen request={request!} />;
}
