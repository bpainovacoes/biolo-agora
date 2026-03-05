import { requireRole } from "@/lib/session";
import { getActiveRequest, getChatMessages } from "@/lib/queries";
import { redirect } from "next/navigation";
import ChatNegotiateScreen from "@/components/biolo/client/ChatNegotiateScreen";

export default async function ClientChatPage() {
  const session = await requireRole("client");
  const request = await getActiveRequest();
  if (!request) redirect("/client/search");
  const messages = await getChatMessages(request!.id);
  return <ChatNegotiateScreen request={request!} messages={messages} session={session} />;
}
