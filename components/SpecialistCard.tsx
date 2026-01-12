import Link from "next/link";
import Image from "next/image";

// FIX: Accept both 'specialist' AND 'data' props to prevent errors
export default function SpecialistCard({ specialist, data, defaultMode = "CLINIC" }: any) {
  
  // 1. Safety Check: Use whichever prop is provided
  const doctor = specialist || data;

  // 2. If data is still missing, don't crash (render nothing or a skeleton)
  if (!doctor) return null;

  return (
    <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center relative overflow-hidden">
      
      {/* Video Badge */}
      {doctor.isVideoAvailable && (
        <div className="absolute top-0 right-0 bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg">
          📹 VIDEO
        </div>
      )}

      <div className="relative mb-4" style={{ width: "120px", height: "120px" }}>
        <Image
          src={doctor.image || "/default-avatar.png"} // Fallback image safety
          alt={doctor.name}
          fill
          className="rounded-full object-cover border-4 border-blue-50"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <h3 className="text-lg font-bold text-gray-900">{doctor.name}</h3>
      <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">
        {doctor.category?.replace("_", " ")}
      </p>
      
      <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10 overflow-hidden">
        {doctor.bio}
      </p>

      <div className="w-full flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="text-left">
          <p className="text-xs text-gray-400">Fee</p>
          <p className="text-base font-bold text-gray-900">
             {/* Show Video fee if default mode is video, else clinic fee */}
             ₹{defaultMode === 'VIDEO' && doctor.videoConsultationFee 
                ? doctor.videoConsultationFee 
                : doctor.price}
          </p>
        </div>
        <Link
          // Pass the mode via Query Param so the details page knows to open Video by default
          href={`/specialists/${doctor.id}?mode=${defaultMode}`}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}