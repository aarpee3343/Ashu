import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import UserDashboardClient from "./UserDashboardClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UserDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h1>
        <Link href="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700">
          Go to Login
        </Link>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: Number((session.user as any).id) },
    include: {
      bookings: {
        include: { 
            specialist: true, 
            clinic: true,
            familyMember: true,
            user: true,
            review: true, // ✅ ADDED: Check if review exists for this booking
            dailyLogs: true
        },
        orderBy: { date: "desc" },
      },
      vitals: true,
      familyMembers: true,
      reviews: {
        include: { specialist: true },
        orderBy: { createdAt: 'desc' }
      }
    },
  });

  if (!user) return <div className="p-10 text-center">User not found.</div>;

  return <UserDashboardClient user={user} />;
}