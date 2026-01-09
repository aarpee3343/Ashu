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
          user: { include: { vitals: true } }, // User profile
          clinic: true,
          dailyLogs: true 
        },
        orderBy: { date: "desc" },
      },
      // Note: We only need slots to check what is explicitly blocked manually
      slots: {
        where: { date: { gte: new Date() } },
        orderBy: { date: 'asc' }
      },
      clinics: true,
      bankAccount: true,
      payouts: true,
      reviews: true
    },
  });

  if (!specialist) return <div className="p-10">Doctor profile not found. Contact Admin.</div>;

  return <DoctorDashboardClient specialist={specialist} />;
}