"use client";

import { useState } from "react";
import Image from "next/image";
import BookingWizard from "@/components/BookingWizard"; // Import New Wizard
import { MapPin, Video, Home, Star, ShieldCheck, PlayCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function SpecialistClient({ specialist, initialMode = "CLINIC" }: any) {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState(initialMode);
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleBookClick = () => {
    if(!session) {
      toast.error("Please login to book");
      return;
    }
    setIsWizardOpen(true);
  };

  return (
    <div className="min-h-screen bg-white pb-32">
      
      {/* 1. IMMERSIVE HEADER */}
      <div className="relative h-64 w-full">
        <Image src="/doctor-bg-pattern.png" alt="bg" fill className="object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white"></div>
        
        <div className="absolute -bottom-12 left-6 flex items-end gap-4">
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gray-100">
            <Image src={specialist.image || "/default-doctor.png"} alt={specialist.name} fill className="object-cover" />
          </div>
        </div>
      </div>

      {/* 2. PROFILE INFO */}
      <div className="mt-14 px-6">
        <h1 className="text-2xl font-bold text-gray-900">{specialist.name}</h1>
        <p className="text-blue-600 font-medium">{specialist.category.replace("_", " ")}</p>
        
        <div className="flex gap-4 mt-4 text-sm border-b border-gray-100 pb-6">
          <div className="flex items-center gap-1"><Star size={16} className="text-yellow-400 fill-yellow-400" /> <span className="font-bold">4.9</span> (120)</div>
          <div className="flex items-center gap-1 text-gray-500"><ShieldCheck size={16} /> {specialist.experience} Yrs Exp.</div>
        </div>

        {/* 3. ABOUT */}
        <div className="mt-6">
          <h3 className="font-bold text-gray-900 mb-2">About</h3>
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-4">{specialist.bio}</p>
        </div>
      </div>

      {/* 4. MODE SELECTION (Clean Cards) */}
      <div className="mt-8 px-6">
        <h3 className="font-bold text-gray-900 mb-4">Choose Service</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: "CLINIC", label: "Clinic", icon: MapPin },
            { id: "VIDEO", label: "Video", icon: Video },
            { id: "HOME", label: "Home", icon: Home }
          ].map((m) => (
            <button key={m.id} onClick={() => setActiveTab(m.id)}
              className={`py-4 rounded-2xl flex flex-col items-center gap-2 border transition-all ${
                activeTab === m.id ? "border-black bg-black text-white shadow-lg" : "border-gray-100 bg-gray-50 text-gray-500"
              }`}
            >
              <m.icon size={20} />
              <span className="text-xs font-bold">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 pb-8 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 font-bold uppercase">Consultation Fee</p>
          <div className="flex items-baseline gap-1">
             <span className="text-2xl font-bold text-gray-900">
               ₹{activeTab === 'VIDEO' ? (specialist.videoConsultationFee || specialist.price) : specialist.price}
             </span>
             {activeTab === 'HOME' && <span className="text-xs text-gray-500">/ visit</span>}
          </div>
        </div>
        <button 
          onClick={handleBookClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 transition-transform active:scale-95"
        >
          Check Slots
        </button>
      </div>

      {/* WIZARD */}
      {session && (
        <BookingWizard 
          isOpen={isWizardOpen} 
          onClose={() => setIsWizardOpen(false)} 
          specialist={specialist} 
          mode={activeTab}
          user={session.user}
        />
      )}
    </div>
  );
}