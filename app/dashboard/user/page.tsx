import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import UserDashboardClient from "./UserDashboardClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UserDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // 🔒 SECURITY CHECK: Only USER role allowed
  const userRole = (session.user as any).role;
  
  if (userRole !== "USER") {
    // If a Doctor tries to access this, show error or redirect to their own dashboard
    if (userRole === "SPECIALIST") redirect("/dashboard/doctor");
    if (userRole === "ADMIN") redirect("/dashboard/admin");
    
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Wrong Dashboard</h1>
        <p className="mb-4">You are logged in as a <strong>{userRole}</strong>.</p>
        <Link href={`/dashboard/${userRole === 'SPECIALIST' ? 'doctor' : 'admin'}`} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
          Go to {userRole} Dashboard
        </Link>
      </div>
    );
  }

  // Fetch full user data
  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    include: {
      bookings: {
        include: { specialist: true },
        orderBy: { date: 'desc' }
      },
      vitals: true
    }
  });

  if (!user) return <p>User not found</p>;

  return <UserDashboardClient user={user} />;
}