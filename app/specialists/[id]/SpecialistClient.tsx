'use client';

import { useState } from "react";
import Image from "next/image";
import BookingWizard from "@/components/BookingWizard"; 
import { MapPin, Video, Home, Star, ShieldCheck, X, LogIn, ChevronRight, GraduationCap, Award, Languages, Building2, ThumbsUp } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SpecialistClient({ specialist, initialMode = "CLINIC" }: any) {
  const { data: session } = useSession();
  const pathname = usePathname();
  
  const [activeTab, setActiveTab] = useState(initialMode);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false); // Read More Toggle

  const handleBookClick = () => {
    if(!session) {
      setShowLoginModal(true);
      return;
    }
    setIsWizardOpen(true);
  };

  const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
  const registerUrl = `/register?callbackUrl=${encodeURIComponent(pathname)}`;

  // UI Helpers
  const consultationFee = activeTab === 'VIDEO' ? (specialist.videoConsultationFee || specialist.price) : specialist.price;
  const reviewCount = specialist.reviews?.length || 0;
  // Calculate average rating
  const avgRating = reviewCount > 0 
    ? (specialist.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewCount).toFixed(1) 
    : "New";

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      
      {/* 1. COMPACT HEADER (Practo Style) */}
      <div className="bg-white border-b sticky top-0 z-30">
         <div className="relative h-48 w-full bg-gradient-to-r from-blue-600 to-cyan-500">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('/doctor-bg-pattern.svg')] bg-cover"></div>
         </div>
         
         <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-16 pb-6 flex flex-col md:flex-row gap-6 relative z-40">
            {/* Profile Image */}
            <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white overflow-hidden shrink-0">
               <Image
                 src={imageError || !specialist.image ? "/default-doctor.png" : specialist.image}
                 alt={specialist.name}
                 fill
                 className="object-cover"
                 onError={() => setImageError(true)}
               />
            </div>

            {/* Basic Info */}
            <div className="pt-2 md:pt-16 flex-1">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                     <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        {specialist.name}
                        {specialist.isVerified && <ShieldCheck className="text-blue-500 fill-blue-100" size={24} />}
                     </h1>
                     <p className="text-gray-500 font-medium">{specialist.education?.[0]?.degree || "Specialist"} - {specialist.category.replace("_", " ")}</p>
                     <p className="text-sm text-gray-400 mt-1">{specialist.experience} Years Experience Overall</p>
                  </div>
                  
                  {/* Rating Badge */}
                  {reviewCount > 0 && (
                      <div className="bg-green-50 border border-green-100 px-4 py-2 rounded-xl text-center min-w-[100px]">
                         <div className="flex items-center justify-center gap-1 font-bold text-green-700 text-lg">
                            <ThumbsUp size={18} fill="currentColor" /> {avgRating}
                         </div>
                         <p className="text-xs text-green-600 font-medium">{reviewCount} Patient Stories</p>
                      </div>
                  )}
               </div>
            </div>
         </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* LEFT COLUMN: Details (2/3 width) */}
         <div className="lg:col-span-2 space-y-8">
            
            {/* About Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded-full"></div> About
               </h3>
               <div className={`text-sm text-gray-600 leading-relaxed ${!showFullBio && 'line-clamp-4'}`}>
                  {specialist.bio}
               </div>
               {specialist.bio && specialist.bio.length > 200 && (
                  <button onClick={() => setShowFullBio(!showFullBio)} className="text-blue-600 font-bold text-sm mt-2 underline">
                     {showFullBio ? "Read Less" : "Read More"}
                  </button>
               )}
            </div>

            {/* Rich Profile Details */}
            <div className="grid md:grid-cols-2 gap-6">
                
                {/* Education */}
                {specialist.educations?.length > 0 && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                       <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                          <GraduationCap size={18} className="text-gray-400" /> Education
                       </h4>
                       <ul className="space-y-4">
                          {specialist.educations.map((edu: any) => (
                             <li key={edu.id} className="text-sm">
                                <p className="font-bold text-gray-800">{edu.degree}</p>
                                <p className="text-gray-500">{edu.college}, {edu.year}</p>
                             </li>
                          ))}
                       </ul>
                    </div>
                )}

                {/* Awards & Memberships */}
                {(specialist.awards?.length > 0 || specialist.memberships?.length > 0) && (
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                       <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                          <Award size={18} className="text-gray-400" /> Achievements
                       </h4>
                       <ul className="space-y-3">
                          {specialist.awards?.map((award: any) => (
                             <li key={award.id} className="text-sm text-gray-600 flex gap-2">
                                <span className="text-yellow-500">★</span> {award.name} ({award.year})
                             </li>
                          ))}
                          {specialist.memberships?.map((mem: any) => (
                             <li key={mem.id} className="text-sm text-gray-600 flex gap-2">
                                <span className="text-blue-500">•</span> {mem.name}
                             </li>
                          ))}
                       </ul>
                    </div>
                )}
            </div>

            {/* Services / Clinics */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
               <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-purple-500 rounded-full"></div> Clinic Locations
               </h3>
               {specialist.clinics?.length > 0 ? (
                   <div className="space-y-4">
                      {specialist.clinics.map((clinic: any) => (
                         <div key={clinic.id} className="flex gap-4 p-4 border rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shrink-0"><Building2 size={20}/></div>
                            <div>
                               <p className="font-bold text-gray-900">{clinic.name}</p>
                               <p className="text-sm text-gray-500">{clinic.address}, {clinic.city}</p>
                               <p className="text-xs font-bold text-blue-600 mt-1">₹{specialist.price} Consultation Fee</p>
                            </div>
                         </div>
                      ))}
                   </div>
               ) : <p className="text-gray-400 italic">No clinics listed.</p>}
            </div>

            {/* Reviews Section */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="font-bold text-lg text-gray-900 mb-6">Patient Stories ({reviewCount})</h3>
                {reviewCount > 0 ? (
                    <div className="space-y-6">
                        {specialist.reviews.map((review: any) => (
                            <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs">
                                            {review.user?.name?.[0] || "A"}
                                        </div>
                                        <span className="font-bold text-sm">{review.user?.name || "Anonymous"}</span>
                                    </div>
                                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                                        {review.rating} <Star size={10} fill="currentColor"/>
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 rounded-xl">
                        <p className="text-gray-500 text-sm">No reviews yet. Be the first to share your experience!</p>
                    </div>
                )}
            </div>

         </div>

         {/* RIGHT COLUMN: Booking Card (Sticky) (1/3 width) */}
         <div className="relative">
            <div className="sticky top-24 bg-white p-6 rounded-3xl border border-gray-200 shadow-xl">
               <h3 className="font-bold text-xl mb-4">Book Appointment</h3>
               
               {/* Mode Switcher */}
               <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                  {[{ id: "CLINIC", label: "Clinic", icon: MapPin }, { id: "VIDEO", label: "Video", icon: Video }, { id: "HOME", label: "Home", icon: Home }].map((m) => (
                     <button key={m.id} onClick={() => setActiveTab(m.id)} className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all ${activeTab === m.id ? "bg-white shadow text-black font-bold" : "text-gray-400 hover:text-gray-600"}`}>
                        <m.icon size={16} className="mb-1" />
                        <span className="text-[10px] uppercase">{m.label}</span>
                     </button>
                  ))}
               </div>

               <div className="flex justify-between items-end mb-6 border-b pb-4">
                  <div>
                     <p className="text-xs text-gray-500 font-bold uppercase">Consultation Fee</p>
                     <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">₹{consultationFee}</span>
                        {activeTab === 'HOME' && <span className="text-xs text-gray-500">/ visit</span>}
                     </div>
                  </div>
                  {activeTab === 'VIDEO' && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Available Today</span>}
               </div>

               <button 
                  onClick={handleBookClick}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 transition-transform active:scale-95 flex items-center justify-center gap-2"
               >
                  Book Slot <ChevronRight size={20} />
               </button>

               <div className="mt-4 text-center">
                  <p className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                     <ShieldCheck size={12} /> Safe & Secure Payment
                  </p>
               </div>
            </div>
         </div>

      </div>

      {/* BOOKING WIZARD */}
      {session && (
        <BookingWizard 
          isOpen={isWizardOpen} 
          onClose={() => setIsWizardOpen(false)} 
          specialist={specialist} 
          mode={activeTab}
          user={session.user}
        />
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
           <div className="bg-white w-full max-w-sm rounded-3xl p-6 relative shadow-2xl animate-slide-up">
              <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={16} /></button>
              <div className="flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 text-2xl"><LogIn /></div>
                 <h3 className="font-bold text-xl mb-2">Login Required</h3>
                 <p className="text-gray-500 text-sm mb-6">You need to be logged in to book an appointment.</p>
                 <div className="w-full space-y-3">
                    <Link href={loginUrl} className="block w-full bg-blue-600 text-white py-3 rounded-xl font-bold">Log In</Link>
                    <Link href={registerUrl} className="block w-full bg-white border-2 border-gray-100 text-gray-900 py-3 rounded-xl font-bold">Create Account</Link>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}