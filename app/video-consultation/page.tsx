import { prisma } from "@/lib/prisma";
import SpecialistCard from "@/components/SpecialistCard";
import { Video } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function VideoConsultationPage() {
  // Fetch doctors who have video enabled
  const specialists = await prisma.specialist.findMany({
    where: { isVideoAvailable: true },
    include: { clinics: true }
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-purple-700 pt-24 pb-12 px-6 rounded-b-[40px] shadow-lg text-center text-white">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4">
           <Video size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Video Consultation</h1>
        <p className="opacity-90 max-w-sm mx-auto">Connect with top specialists instantly from the comfort of your home.</p>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialists.map((doc) => (
            // Pass VIDEO mode so the card knows to open Video tab by default
            <SpecialistCard key={doc.id} specialist={doc} defaultMode="VIDEO" />
          ))}
        </div>
        
        {specialists.length === 0 && (
           <div className="text-center py-12 text-gray-500">
             No specialists available for video right now.
           </div>
        )}
      </div>
    </div>
  );
}