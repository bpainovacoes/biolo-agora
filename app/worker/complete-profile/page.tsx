import { requireRole } from "@/lib/session";
import { getMe } from "@/lib/queries";
import CompleteProfileScreen from "@/components/biolo/worker/CompleteProfileScreen";

export default async function WorkerCompleteProfilePage() {
  await requireRole("worker");
  const user = await getMe();
  return <CompleteProfileScreen user={user} />;
}
