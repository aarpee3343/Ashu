import { prisma } from "@/lib/prisma";
import SpecialistClient from "./SpecialistClient";

export default async function SpecialistDetailsPage({ 
  params, 
  searchParams 
}: { 
  params: { id: string }, 
  searchParams: { mode?: string } 
}) {
  
  // 1. Fetch Doctor
  const specialist = await prisma.specialist.findUnique({
    where: { id: Number(params.id) },
    include: {
      clinics: true,
      reviews: true,
      slots: {
        where: { isBooked: false, date: { gte: new Date() } },
        orderBy: { date: 'asc' }
      }
    }
  });

  if (!specialist) {
    return <div className="p-12 text-center text-gray-500">Specialist not found.</div>;
  }

  // 2. Determine Mode (Default to CLINIC if not specified)
  const mode = searchParams.mode === "VIDEO" && specialist.isVideoAvailable 
    ? "VIDEO" 
    : "CLINIC";

  // 3. Pass to Client Component
  return <SpecialistClient specialist={specialist} initialMode={mode} />;
}