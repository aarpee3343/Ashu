import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Make sure this path points to your auth config
import { redirect } from "next/navigation";

export default async function DashboardGateway() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const role = (session.user as any).role;

  if (role === "ADMIN") {
    redirect("/dashboard/admin");
  } else if (role === "SPECIALIST") {
    redirect("/dashboard/doctor");
  } else {
    redirect("/dashboard/user");
  }

  // Fallback return (won't be reached due to redirects)
  return <div>Redirecting...</div>;
}