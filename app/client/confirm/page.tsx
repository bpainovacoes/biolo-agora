import { requireRole } from "@/lib/session";
import { getActiveRequest } from "@/lib/queries";
import { redirect } from "next/navigation";
import ConfirmServiceScreen from "@/components/biolo/client/ConfirmServiceScreen";

export default async function ClientConfirmPage() {
  await requireRole("client");
  const request = await getActiveRequest();
  if (!request) redirect("/client/search");
  return <ConfirmServiceScreen request={request!} />;
}
