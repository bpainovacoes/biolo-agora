import { requireRole } from "@/lib/session";
import { getActiveRequest } from "@/lib/queries";
import { redirect } from "next/navigation";
import RateScreen from "@/components/biolo/client/RateScreen";

export default async function ClientRatePage() {
  await requireRole("client");
  const request = await getActiveRequest();
  if (!request) redirect("/client/dashboard");
  return <RateScreen request={request!} />;
}
