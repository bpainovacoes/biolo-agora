import { requireRole } from "@/lib/session";
import { getActiveRequest, getChatMessages } from "@/lib/queries";
import { redirect } from "next/navigation";
import WorkerChatScreen from "@/components/biolo/worker/WorkerChatScreen";

export default async function WorkerChatPage() {
  const session = await requireRole("worker");
  const request = await getActiveRequest();
  if (!request) redirect("/worker/available");
  const messages = await getChatMessages(request!.id);
  return <WorkerChatScreen request={request!} messages={messages} session={session} />;
}
