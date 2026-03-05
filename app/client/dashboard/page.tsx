import { requireRole } from "@/lib/session";
import { getMe } from "@/lib/queries";
import ClientDashboardHome from "@/components/biolo/client/ClientDashboardHome";

export default async function ClientDashboardPage() {
  await requireRole("client");
  const user = await getMe();

  console.log(user);
  return <ClientDashboardHome user={user} />;
}
