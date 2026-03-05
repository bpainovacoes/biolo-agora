import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingScreen from "@/components/biolo/screens/LandingScreen";

export default async function Home() {
  const session = await auth();
  const role = session?.user?.role;

  if (role === "admin")  redirect("/admin");
  if (role === "worker") redirect("/worker/dashboard");
  if (role === "client") redirect("/client/dashboard");

  return <LandingScreen />;
}
