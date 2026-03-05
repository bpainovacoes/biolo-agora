import { requireRole } from "@/lib/session";
import { getProfessionals } from "@/lib/queries";
import SearchScreen from "@/components/biolo/client/SearchScreen";

export default async function ClientSearchPage() {
await requireRole("client");
  const { professionals } = await getProfessionals({ available: true });
console.log("Todos os", professionals)
  return <SearchScreen professionals={professionals}/>;
}
