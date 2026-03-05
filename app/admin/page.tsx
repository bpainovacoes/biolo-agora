import { requireRole } from "@/lib/session";
import { getAdminStats, getAdminUsers } from "@/lib/queries";
import AdminApp from "@/components/biolo/admin/AdminApp";

export default async function AdminPage() {
  const session = await requireRole("admin");
  const [stats, users] = await Promise.all([getAdminStats(), getAdminUsers()]);
  return <AdminApp session={session} stats={stats} users={users} />;
}
