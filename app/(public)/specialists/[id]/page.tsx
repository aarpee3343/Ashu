import { prisma } from "@/lib/prisma";
import BookingCalendar from "@/components/BookingCalendar";
import Image from "next/image";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SpecialistProfile({
  params,
}: {
  params: { id: string };
}) {
  const specialist = await prisma.specialist.findUnique({
    where: { id: Number(params.id) },
    include: { clinics: true, reviews: true } // <--- Include Clinics
  });

  if (!specialist) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT: Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="relative w-full aspect-square mb-6 rounded-xl overflow-hidden">
                <Image src={specialist.image} alt={specialist.name} fill className="object-cover" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900">{specialist.name}</h1>
              <p className="text-blue-600 font-medium">{specialist.category}</p>
              
              {/* NEW: Degree & Hospitals */}
              <div className="mt-4 text-sm text-gray-600 space-y-1">
                 <p>🎓 {specialist.qualifications || "MBBS"}</p>
                 <p>🏥 {specialist.hospitals || "City Hospital"}</p>
              </div>

              <div className="mt-6 pt-6 border-t flex justify-between">
                 <div>
                    <span className="text-gray-500 text-xs uppercase font-bold">Experience</span>
                    <p className="font-bold">{specialist.experience} Years</p>
                 </div>
                 <div className="text-right">
                    <span className="text-gray-500 text-xs uppercase font-bold">Fee</span>
                    <p className="font-bold text-blue-600">₹{specialist.price}</p>
                 </div>
              </div>
            </div>

            {/* NEW: Clinics List */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-900 mb-3">Available at Clinics</h3>
               {specialist.clinics.length > 0 ? (
                 <ul className="space-y-3">
                    {specialist.clinics.map((c) => (
                       <li key={c.id} className="text-sm bg-gray-50 p-3 rounded-lg">
                          <p className="font-bold text-gray-800">{c.name}</p>
                          <p className="text-gray-500 text-xs">{c.address}, {c.city}</p>
                       </li>
                    ))}
                 </ul>
               ) : <p className="text-gray-400 text-sm">No clinics listed.</p>}
            </div>
          </div>

          {/* RIGHT: Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Select a Time Slot</h2>
              <BookingCalendar specialist={specialist} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}