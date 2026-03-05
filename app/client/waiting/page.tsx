import { requireRole } from "@/lib/session";
import { getActiveRequest } from "@/lib/queries";
import { redirect } from "next/navigation";
import WaitingScreen from "@/components/biolo/client/WaitingScreen";

export default async function ClientWaitingPage() {
  await requireRole("client");
  const request = await getActiveRequest();
  if (!request) redirect("/client/search");
  return <WaitingScreen request={request!} />;
}
