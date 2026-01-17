import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DoctorDashboardClient from "./DoctorDashboardClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DoctorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "SPECIALIST") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-700">
        <h1 className="text-3xl font-bold mb-2">⛔ Access Denied</h1>
        <Link href="/login" className="underline">Go to Login</Link>
      </div>
    );
  }

  const specialist = await prisma.specialist.findFirst({
    where: { userId: Number((session.user as any).id) },
    include: {
      bookings: {
        include: { 
          user: { include: { vitals: true } }, 
          clinic: true,
          dailyLogs: true 
        },
        orderBy: { date: "desc" },
      },
      slots: {
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' }
      },
      clinics: true,
      bankAccount: true,
      payouts: true,
      reviews: true,
      
      // ✅ ADDED: Rich Profile Data (Crucial for the new Profile Editor)
      educations: true,
      awards: true,
      memberships: true,
      registrations: true
    },
  });

  if (!specialist) return <div className="p-10">Doctor profile not found. Contact Admin.</div>;

  return <DoctorDashboardClient specialist={specialist} />;
}