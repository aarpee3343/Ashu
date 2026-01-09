import Link from "next/link";
import Image from "next/image";

export default function SpecialistCard({ specialist }: any) {
  return (
    <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col items-center text-center">
      
      {/* FORCE SIZE: Added inline styles (style={{...}}) to guarantee size limit */}
      <div 
        className="relative mb-4" 
        style={{ width: "120px", height: "120px" }} // <--- THIS PREVENTS THE BIG IMAGE
      >
        <Image
          src={specialist.image}
          alt={specialist.name}
          fill
          className="rounded-full object-cover border-4 border-blue-50"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      <h3 className="text-lg font-bold text-gray-900">{specialist.name}</h3>
      <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-2">
        {specialist.category}
      </p>
      
      <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10 overflow-hidden">
        {specialist.bio}
      </p>

      <div className="w-full flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="text-left">
          <p className="text-xs text-gray-400">Fee</p>
          <p className="text-base font-bold text-gray-900">₹{specialist.price}</p>
        </div>
        <Link
          href={`/specialists/${specialist.id}`}
          className="bg-blue-600 hover:bg-blue-700 ..."
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}