import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SpecialistClient from "./SpecialistClient";
import Link from "next/link";

export default async function SpecialistDetailsPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string }, 
  searchParams: { mode?: string } 
}) {
  // 1. Get User Session & Role
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  // 2. Fetch Doctor Data
  const specialist = await prisma.specialist.findUnique({
    where: { id: Number(params.id) },
    include: {
      clinics: true,
      reviews: { include: { user: true } },
      educations: true,
      awards: true,
      languages: true,
      registrations: true,
      memberships: true,
      slots: {
        where: { isBooked: false, date: { gte: new Date() } },
        orderBy: { date: 'asc' }
      }
    }
  });

  if (!specialist) {
    return <div className="p-12 text-center text-gray-500">Specialist not found.</div>;
  }

  // 3. RESTRICTION CHECK (Fixed)
  // ✅ FIX: Removed 'ADMIN' from here. Admins can now view the page.
  // Only Specialists are blocked from viewing other specialists (to prevent confusion).
  if (session && userRole === 'SPECIALIST') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Doctor Account Detected</h2>
          <p className="text-gray-500 mb-6 text-sm">
            Please log in with a <strong>Patient Account</strong> to book appointments.
          </p>
          <Link href="/dashboard/doctor" className="bg-black text-white px-6 py-3 rounded-xl font-bold">
             Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // 4. Determine Mode
  const mode = searchParams.mode === "VIDEO" && specialist.isVideoAvailable ? "VIDEO" : "CLINIC";

  return <SpecialistClient specialist={specialist} initialMode={mode} />;
}