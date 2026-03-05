import { requireRole } from "@/lib/session";
import { getProfessional } from "@/lib/queries";
import ProfessionalProfileScreen from "@/components/biolo/client/ProfessionalProfileScreen";
import { sendServiceRequestAction, type ServiceRequestPayload } from "@/actions/data";
import { redirect } from "next/navigation";

export default async function ProfessionalProfilePage({ params }: { params: Promise<{ workerId: string }> }) {
  const { workerId } = await params;
  await requireRole("client");
  const worker = await getProfessional(workerId);

  async function submitRequest(payload: ServiceRequestPayload) {
    "use server";
    const res = await sendServiceRequestAction(payload);
    if (res.ok) redirect("/client/waiting");
    return res;
  }

  return <ProfessionalProfileScreen worker={worker} submitRequest={submitRequest} />;
}
