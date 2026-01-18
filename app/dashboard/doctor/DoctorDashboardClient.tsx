"use client";

import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import toast from "react-hot-toast";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import AsyncButton from "@/components/ui/AsyncButton";
import Link from "next/link";
import { 
  Video, MapPin, Clock, CreditCard, FileText, CheckCircle, X, 
  UploadCloud, CalendarCheck, IndianRupee, Plus, Trash2, ShieldCheck, 
  AlertCircle, Building2, Wallet, DollarSign, Banknote, Star, MessageSquare
} from "lucide-react";

const ALL_TIMES = [
  "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
];

export default function DoctorDashboardClient({ specialist }: any) {
  const router = useRouter();
  
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState("APPOINTMENTS");
  const [profileImage, setProfileImage] = useState(specialist.image || "/icon-r.png");

  useEffect(() => {
    if (specialist.image) {
      setProfileImage(specialist.image);
    }
  }, [specialist.image]);
  
  // Calendar & Slots
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date>(new Date());
  const [selectedSlotsForAction, setSelectedSlotsForAction] = useState<string[]>([]);
  
  // Modals
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [sessionModalOpen, setSessionModalOpen] = useState(false); // For Multi-day sessions
  const [completeModalOpen, setCompleteModalOpen] = useState(false); // For Final Rx
  const [detailsModalOpen, setDetailsModalOpen] = useState(false); // For Viewing Info
  const [clinicModalOpen, setClinicModalOpen] = useState(false); // NEW: Add Clinic Modal

  // Forms
  const [rxForm, setRxForm] = useState({ diagnosis: "", advice: "", medicines: "" });
  const [uploadedRxUrl, setUploadedRxUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Session Logic
  const [currentSessionCost, setCurrentSessionCost] = useState(0);
  const [cashCollectedCheck, setCashCollectedCheck] = useState(false);
  const [collectionAmount, setCollectionAmount] = useState<string>(""); // Manual Input

  // Clinic Form (NEW)
  const [newClinic, setNewClinic] = useState({ 
    name: "", address: "", city: "", state: "Haryana", pincode: "" 
  });

  // Settings Forms
  const [bankForm, setBankForm] = useState(specialist.bankAccount || { 
    accountHolder: "", accountNumber: "", bankName: "", ifscCode: "" 
  });
  
  // --- ENHANCED PROFILE FORM ---
  const [profileForm, setProfileForm] = useState({
    bio: specialist.bio || "",
    experience: specialist.experience || 0,
    price: specialist.price || 0,
    qualifications: specialist.qualifications || "", // Legacy fallback
    isVideoAvailable: specialist.isVideoAvailable,
    videoConsultationFee: specialist.videoConsultationFee || 0,
    // Dynamic Arrays
    educations: specialist.educations || [],
    awards: specialist.awards || [],
    memberships: specialist.memberships || [],
    registrations: specialist.registrations || [],
    clinics: specialist.clinics || []
  });

  // Helper functions for dynamic lists
  const updateList = (field: string, index: number, key: string, value: string) => {
    const list = [...(profileForm as any)[field]];
    list[index][key] = value;
    setProfileForm({ ...profileForm, [field]: list });
  };

  const addListItem = (field: string, template: any) => {
    setProfileForm({ ...profileForm, [field]: [...(profileForm as any)[field], template] });
  };

  const removeListItem = (field: string, index: number) => {
    const list = [...(profileForm as any)[field]];
    list.splice(index, 1);
    setProfileForm({ ...profileForm, [field]: list });
  };

  // --- PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem("doctorTab");
    if (saved) setActiveTab(saved);
  }, []);

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem("doctorTab", tab);
  };

  // --- FINANCIAL CALCULATIONS ---
  const totalRevenue = specialist.bookings.reduce((sum: number, b: any) => sum + b.totalPrice, 0);
  const cashCollected = specialist.bookings.filter((b: any) => b.paymentType === "PAY_ON_SERVICE").reduce((sum: number, b: any) => sum + (b.amountPaid || 0), 0);
  const onlineCollected = specialist.bookings.filter((b: any) => b.paymentType === "UPI_ONLINE" || b.paymentType === "ONLINE_ADVANCE").reduce((sum: number, b: any) => sum + b.amountPaid, 0);
  const totalCommission = Math.round((totalRevenue * specialist.commissionRate) / 100);
  const payoutEligibleAmount = onlineCollected - totalCommission;

  // --- ACTIONS: SLOTS ---
  const toggleSlotSelection = (time: string) => {
    if (selectedSlotsForAction.includes(time)) {
      setSelectedSlotsForAction(prev => prev.filter(t => t !== time));
    } else {
      setSelectedSlotsForAction(prev => [...prev, time]);
    }
  };

  const handleBulkSlotAction = async (action: "BLOCK" | "OPEN") => {
    if(selectedSlotsForAction.length === 0) return toast.error("Select slots first");
    const dateStr = format(selectedSlotDate, "yyyy-MM-dd");
    const toastId = toast.loading("Updating schedule...");
    try {
      await Promise.all(selectedSlotsForAction.map(time => 
         fetch("/api/doctor/slots", {
            method: "POST",
            body: JSON.stringify({ date: dateStr, time, action }),
         })
      ));
      toast.success("Schedule Updated", { id: toastId });
      setSelectedSlotsForAction([]);
      router.refresh();
    } catch { toast.error("Failed", { id: toastId }); }
  };

  // --- ACTIONS: PROFILE & BANK ---

  // NEW: Profile Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation (optional but good UX)
    if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file (JPG, PNG, etc.)");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
    }

    const toastId = toast.loading("Uploading photo...");
    
    try {
        const formData = new FormData();
        formData.append("file", file);
        
        // Generate filename - use specialist ID
        const filename = `profile-${specialist.id}.jpg`;
        
        // Upload to Vercel Blob with overwrite permission
        const res = await fetch(
          `/api/upload?filename=${filename}&public=true`, 
          { 
            method: "POST", 
            body: formData 
          }
        );
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Upload failed");
        }
        
        // 2. Save URL to Database
        await fetch("/api/doctor/profile", { 
            method: "PATCH", 
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ image: data.url }) 
        });

        // 3. INSTANTLY Update UI
        setProfileImage(data.url); 

        toast.success("Photo updated successfully!", { id: toastId });
        
        // 4. Refresh server data in background
        router.refresh();
        
    } catch (error: any) {
        console.error("Upload error:", error);
        toast.error(error.message || "Upload failed", { id: toastId });
    } finally {
        // Clear the file input
        e.target.value = "";
    }
};

  const handleUpdateProfile = async () => {
    const loadingId = toast.loading("Updating...");
    try {
      // 1. Sanitize Payload (Convert Strings to Numbers)
      const payload = {
          ...profileForm,
          price: Number(profileForm.price) || 0, // Force Number
          experience: Number(profileForm.experience) || 0,
          videoConsultationFee: Number(profileForm.videoConsultationFee) || 0
      };

      const res = await fetch("/api/doctor/profile", { 
          method: "PATCH", 
          body: JSON.stringify(payload) 
      });

      if(!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Update failed");
      }
      
      toast.success("Profile Updated", { id: loadingId });
      router.refresh();
    } catch (e: any) { 
      toast.error(e.message || "Update failed", { id: loadingId }); 
    }
  };

  const handleSaveBank = async () => {
    await fetch("/api/doctor/bank", { method: "POST", body: JSON.stringify(bankForm) });
    toast.success("Bank Saved");
    router.refresh();
  };

  // --- NEW ACTIONS FROM UPDATE ---

  // NEW: Add Clinic
  const handleAddClinic = async () => {
    if(!newClinic.name || !newClinic.address) return toast.error("Name & Address required");
    const id = toast.loading("Adding Clinic...");
    try {
        await fetch("/api/doctor/clinics", { method: "POST", body: JSON.stringify(newClinic) });
        toast.success("Clinic Added", { id });
        setClinicModalOpen(false);
        setNewClinic({ name: "", address: "", city: "", state: "Haryana", pincode: "" });
        router.refresh();
    } catch { toast.error("Failed", { id }); }
  };

  // NEW: Request Payout
  const handleRequestPayout = async () => {
    if(payoutEligibleAmount < 500) return toast.error("Minimum ₹500 required for payout");
    const id = toast.loading("Requesting...");
    try {
        await fetch("/api/doctor/payout", { method: "POST", body: JSON.stringify({ amount: payoutEligibleAmount }) });
        toast.success("Payout Requested", { id });
        router.refresh();
    } catch { toast.error("Failed", { id }); }
  };

  // --- ACTIONS: APPOINTMENT HANDLING ---

  // 1. Open Correct Modal (Session vs Completion)
  const openActionModal = (booking: any) => {
    setSelectedBooking(booking);
    setCashCollectedCheck(false); // Reset check
    setCollectionAmount(""); // Reset manual input
    
    // Logic: If duration > 1, open Session Manager. Else open Final Completion.
    if (booking.duration > 1) {
        setCurrentSessionCost(booking.totalPrice / booking.duration);
        setSessionModalOpen(true);
    } else {
        setCurrentSessionCost(booking.totalPrice);
        setCompleteModalOpen(true);
    }
  };

  // 2. Upload Prescription File
  const handleUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`/api/upload?filename=${file.name}`, { method: "POST", body: formData });
        const data = await res.json();
        setUploadedRxUrl(data.url);
        toast.success("File attached");
    } catch { toast.error("Upload failed"); } 
    finally { setIsUploading(false); }
  };

  // 3. Mark ONE DAY as Done (For Physio/Home visits)
  const markSessionDone = async (logId: number) => {
    const amount = Number(collectionAmount) || 0;
    const toastId = toast.loading("Updating session...");
    
    // A. Mark Log as Completed
    await fetch("/api/doctor/daily-logs", {
        method: "PATCH",
        body: JSON.stringify({ logId, status: "COMPLETED" })
    });

    // B. Add Cash (If collected)
    if (amount > 0) {
        await fetch(`/api/bookings/${selectedBooking.id}`, {
            method: "PATCH",
            body: JSON.stringify({ action: "ADD_PAYMENT", amount: amount })
        });
    }

    toast.success("Session Updated", { id: toastId });
    setCollectionAmount(""); // Reset
    setSessionModalOpen(false); 
    router.refresh();
  };

  // 4. Final Completion (Structured Rx)
  const completeBooking = async () => {
    if (!rxForm.diagnosis && !uploadedRxUrl) return toast.error("Please add diagnosis or upload file");
    
    const toastId = toast.loading("Generating report...");
    
    // Create structured object
    const finalRx = JSON.stringify({ 
        diagnosis: rxForm.diagnosis,
        advice: rxForm.advice,
        medicines: rxForm.medicines,
        file: uploadedRxUrl 
    });

    const amountToAdd = cashCollectedCheck ? currentSessionCost : 0;

    try {
        await fetch(`/api/bookings/${selectedBooking.id}`, {
          method: "PATCH",
          body: JSON.stringify({ 
              action: "UPDATE_STATUS", 
              status: "COMPLETED", 
              amountCollected: amountToAdd, 
              prescription: finalRx 
          }),
        });
        toast.success("Booking Completed Successfully!", { id: toastId });
        setCompleteModalOpen(false);
        setRxForm({ diagnosis: "", advice: "", medicines: "" });
        router.refresh();
    } catch {
        toast.error("Failed to complete", { id: toastId });
    }
  };

  const calendarDays = useMemo(() => eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) }), [currentDate]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 mb-8 flex flex-col md:flex-row gap-6 shadow-sm items-center">
           <div className="relative group">
             <div className="relative w-24 h-24">
               <Image 
                  src={profileImage} 
                  alt="Profile" 
                  fill 
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // <--- ADD THIS LINE
                  className="rounded-full object-cover border-4 border-gray-50 shadow-sm"
                  onError={() => setProfileImage("/icon-r.png")}
                />
             </div>
             {/* Photo upload button */}
             <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-colors z-10">
                <UploadCloud size={14} />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
             </label>
           </div>
           
           <div className="text-center md:text-left">
             {/* Verification status */}
             <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
               <h1 className="text-3xl font-bold text-gray-900">Dr. {specialist.name}</h1>
               {specialist.isVerified ? (
                 <span className="text-blue-500" title="Verified Profile">
                   <ShieldCheck size={20} fill="#e0f2fe" />
                 </span>
               ) : (
                 <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1">
                   <AlertCircle size={10} /> Pending Verification
                 </span>
               )}
             </div>
             
             <p className="text-gray-500 font-medium">{specialist.category.replace("_", " ")}</p>
             <div className="flex gap-2 justify-center md:justify-start mt-2">
                {specialist.isVideoAvailable && <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold flex items-center gap-1"><Video size={12} /> Video Enabled</span>}
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold flex items-center gap-1"><Clock size={12} /> {specialist.experience} Yrs Exp</span>
             </div>
           </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
           {[
             { id: "APPOINTMENTS", label: "Appointments" },
             { id: "SLOTS", label: "Schedule" },
             { id: "REVIEWS", label: "Reviews" },
             { id: "FINANCIALS", label: "Earnings" },
             { id: "PROFILE", label: "Settings" }
           ].map(tab => (
             <AsyncButton key={tab.id} onClick={() => changeTab(tab.id)} 
               className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-black text-white shadow-lg" : "bg-white text-gray-500 hover:bg-gray-100"}`}>
               {tab.label}
             </AsyncButton>
           ))}
           <AsyncButton onClick={() => signOut()} className="ml-auto text-red-600 font-bold text-sm px-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">Log Out</AsyncButton>
        </div>

        {/* --- TAB 1: APPOINTMENTS --- */}
        {activeTab === "APPOINTMENTS" && (
          <div className="space-y-4">
            {specialist.bookings.length === 0 && (
                <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-gray-300">
                    <p className="text-gray-400 font-medium">No appointments found.</p>
                </div>
            )}
            
            {specialist.bookings.map((b: any) => (
              <div key={b.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
                {/* Color Strip Status */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${b.status === 'COMPLETED' ? 'bg-green-500' : b.status === 'CANCELLED' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                
                <div className="pl-4">
                  <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-xl text-gray-900">{b.user.name}</h3>
                      {b.locationType === 'VIDEO' && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1"><Video size={10}/> VIDEO</span>}
                      {b.locationType === 'HOME' && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-1 rounded-md font-bold flex items-center gap-1"><MapPin size={10}/> HOME</span>}
                  </div>
                  
                  <p className="text-sm text-gray-500 font-medium mb-3">
                      {format(new Date(b.date), "EEEE, dd MMM")} • <span className="text-black">{b.slotTime}</span>
                  </p>

                  <div className="flex items-center gap-3 text-xs font-bold">
                     {/* Multi Day Badge */}
                     {b.duration > 1 && (
                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded flex items-center gap-1"><CalendarCheck size={12}/> {b.duration} Day Plan</span>
                     )}
                    
                     {/* Payment Status Badge */}
                     <span className={`flex items-center gap-1 px-2 py-1 rounded ${b.amountPaid >= b.totalPrice ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        <IndianRupee size={12} /> {b.amountPaid >= b.totalPrice ? 'PAID FULL' : `DUE: ₹${b.totalPrice - b.amountPaid}`}
                     </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pl-4">
                   <AsyncButton onClick={() => { setSelectedBooking(b); setDetailsModalOpen(true); }} className="w-full sm:w-auto px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                      Details
                   </AsyncButton>
                   
                   {b.status === "UPCOMING" && (
                      <>
                        {b.locationType === 'VIDEO' && (
                           <Link 
                             href={`/room/${b.id}`} 
                             target="_blank"
                             className="w-full sm:w-auto bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                           >
                              <Video size={16} /> Join Call
                           </Link>
                        )}
                        
                        {/* SMART ACTION BUTTON */}
                        <AsyncButton 
                            onClick={() => openActionModal(b)} 
                            className="w-full sm:w-auto bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                        >
                           {b.duration > 1 ? "Manage Sessions" : "Complete"}
                        </AsyncButton>
                      </>
                   )}
                   {b.status === "COMPLETED" && (
                       <div className="flex items-center gap-1 text-green-600 font-bold px-4 bg-green-50 py-2 rounded-xl border border-green-100">
                           <CheckCircle size={18} /> Completed
                       </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- TAB 2: SCHEDULE (SLOTS) --- */}
        {activeTab === "SLOTS" && (
          <div className="grid lg:grid-cols-3 gap-8">
              {/* Calendar */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 h-fit">
                 <div className="flex justify-between mb-6 font-bold text-lg">
                    <AsyncButton onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="hover:bg-gray-100 p-2 rounded-lg">←</AsyncButton>
                    <span>{format(currentDate, "MMMM yyyy")}</span>
                    <AsyncButton onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="hover:bg-gray-100 p-2 rounded-lg">→</AsyncButton>
                 </div>
                 <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {['S','M','T','W','T','F','S'].map((d, i) => (
                      <span
                        key={`${d}-${i}`}
                        className="text-xs font-bold text-gray-400"
                      >
                        {d}
                      </span>
                    ))}
                 </div>
                 <div className="grid grid-cols-7 gap-2 text-center">
                    {calendarDays.map(day => {
                      const isSelected = isSameDay(day, selectedSlotDate);
                      const hasBooking = specialist.bookings.some((b: any) => isSameDay(new Date(b.date), day) && b.status !== 'CANCELLED');
                      return (
                        <AsyncButton key={day.toString()} onClick={() => setSelectedSlotDate(day)} 
                            className={`p-2 rounded-xl text-sm font-medium transition-all ${isSelected ? "bg-black text-white shadow-md" : "hover:bg-gray-50"} ${hasBooking ? "ring-2 ring-red-100 text-red-600" : ""}`}>
                          {format(day, "d")}
                        </AsyncButton>
                      )
                    })}
                 </div>
              </div>

              {/* Slot Manager */}
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl">Availability for {format(selectedSlotDate, "dd MMM")}</h3>
                    <div className="flex gap-2">
                       <AsyncButton onClick={() => handleBulkSlotAction("OPEN")} className="text-green-700 bg-green-50 text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-100">Mark Available</AsyncButton>
                       <AsyncButton onClick={() => handleBulkSlotAction("BLOCK")} className="text-red-700 bg-red-50 text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-100">Mark Busy</AsyncButton>
                    </div>
                 </div>
                 <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {ALL_TIMES.map(time => {
                       const isBooked = specialist.bookings.some((b: any) => isSameDay(new Date(b.date), selectedSlotDate) && b.slotTime === time && b.status !== 'CANCELLED');
                       const isBlocked = specialist.slots.some((s: any) => isSameDay(new Date(s.date), selectedSlotDate) && s.startTime === time && s.isBooked);
                       const isSelected = selectedSlotsForAction.includes(time);
                       
                       let bgClass = "bg-white border-gray-200 text-gray-600 hover:border-black";
                       if (isBooked) bgClass = "bg-red-50 border-red-200 text-red-400 cursor-not-allowed";
                       else if (isBlocked) bgClass = "bg-gray-100 border-gray-200 text-gray-400";
                       if (isSelected) bgClass = "bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500";

                       return (
                         <AsyncButton key={time} onClick={() => !isBooked && toggleSlotSelection(time)} disabled={isBooked} 
                            className={`p-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${bgClass}`}>
                            {time}
                            <span className="text-[9px] uppercase font-extrabold opacity-70">{isBooked ? "Booked" : isBlocked ? "Blocked" : "Open"}</span>
                         </AsyncButton>
                       )
                    })}
                 </div>
              </div>
          </div>
        )}

        {/* --- TAB 3: REVIEWS --- */}
        {activeTab === "REVIEWS" && (
          <div className="space-y-4">
             {specialist.reviews.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-3xl border border-gray-100">
                   <p className="text-gray-400">No reviews yet.</p>
                </div>
             ) : (
                specialist.reviews.map((r: any) => (
                   <div key={r.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                               {r.user?.name?.[0] || "A"}
                            </div>
                            <div>
                               <p className="font-bold text-gray-900">{r.user?.name || "Anonymous"}</p>
                               <p className="text-xs text-gray-500">{format(new Date(r.createdAt), "dd MMM yyyy")}</p>
                            </div>
                         </div>
                         <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                            {r.rating} <Star size={10} fill="currentColor" />
                         </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed">"{r.comment}"</p>
                   </div>
                ))
             )}
          </div>
        )}

        {/* --- TAB 4: FINANCIALS (UPDATED with Payout) --- */}
        {activeTab === "FINANCIALS" && (
          <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-white p-6 border rounded-2xl shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Total Revenue</p>
                    <p className="font-bold text-2xl">₹{totalRevenue}</p>
                 </div>
                 <div className="bg-white p-6 border rounded-2xl shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Cash Collected</p>
                    <p className="font-bold text-2xl text-orange-600">₹{cashCollected}</p>
                 </div>
                 <div className="bg-white p-6 border rounded-2xl shadow-sm">
                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Online Paid</p>
                    <p className="font-bold text-2xl text-blue-600">₹{onlineCollected}</p>
                 </div>
                 <div className="black text-white p-6 border border-black rounded-2xl shadow-lg">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Payout Pending</p>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-2xl text-green-400">₹{payoutEligibleAmount}</p>
                      <AsyncButton 
                        onClick={handleRequestPayout} 
                        disabled={payoutEligibleAmount < 500}
                        className={`text-xs px-3 py-1 rounded-lg font-bold transition-colors ${payoutEligibleAmount >= 500 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-700 text-gray-300 cursor-not-allowed'}`}
                      >
                        <Wallet size={12} className="inline mr-1" /> Withdraw
                      </AsyncButton>
                    </div>
                    {payoutEligibleAmount < 500 && (
                      <p className="text-xs text-gray-300 mt-2">Minimum ₹500 required</p>
                    )}
                 </div>
              </div>
              
              <div className="bg-white p-8 rounded-3xl border border-gray-100">
                 <h3 className="font-bold text-lg mb-4">Bank Details</h3>
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <input placeholder="Account Holder" className="w-full border p-3 rounded-xl bg-gray-50" value={bankForm.accountHolder} onChange={e => setBankForm({...bankForm, accountHolder: e.target.value})} />
                        <input placeholder="Account Number" className="w-full border p-3 rounded-xl bg-gray-50" value={bankForm.accountNumber} onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})} />
                    </div>
                    <div className="space-y-4">
                        <input placeholder="Bank Name" className="w-full border p-3 rounded-xl bg-gray-50" value={bankForm.bankName} onChange={e => setBankForm({...bankForm, bankName: e.target.value})} />
                        <input placeholder="IFSC Code" className="w-full border p-3 rounded-xl bg-gray-50" value={bankForm.ifscCode} onChange={e => setBankForm({...bankForm, ifscCode: e.target.value})} />
                    </div>
                 </div>
                 <div className="mt-6 flex gap-4">
                    <AsyncButton onClick={handleSaveBank} className="bg-black text-white px-6 py-3 rounded-xl font-bold">Save Bank Details</AsyncButton>
                 </div>
              </div>
          </div>
        )}

        {/* --- TAB 5: PROFILE SETTINGS - ENHANCED --- */}
        {activeTab === "PROFILE" && (
           <div className="space-y-8 max-w-4xl mx-auto">
              
              {/* Basic Information Section */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                 <h3 className="font-bold text-xl mb-6">Basic Information</h3>
                 
                 <div className="space-y-6">
                   {/* Video Consultations Toggle */}
                   <div className="flex items-center justify-between p-4 border rounded-xl bg-purple-50 border-purple-100">
                      <div>
                          <h4 className="font-bold text-purple-900">Video Consultations</h4>
                          <p className="text-xs text-purple-700">Allow patients to book online video calls with you.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={profileForm.isVideoAvailable} onChange={e => setProfileForm({...profileForm, isVideoAvailable: e.target.checked})} />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                   </div>

                   {/* Fee Settings */}
                   <div className="grid md:grid-cols-2 gap-6">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Clinic Fee (₹)</label>
                          <input type="number" className="w-full p-3 border rounded-xl" value={profileForm.price} onChange={e => setProfileForm({...profileForm, price: Number(e.target.value)})} />
                      </div>
                      {profileForm.isVideoAvailable && (
                          <div className="animate-fade-in">
                              <label className="block text-xs font-bold text-purple-600 uppercase mb-1">Video Fee (₹ / 15m)</label>
                              <input type="number" className="w-full p-3 border border-purple-200 rounded-xl bg-purple-50 text-purple-900 font-bold" value={profileForm.videoConsultationFee || ''} onChange={e => setProfileForm({...profileForm, videoConsultationFee: Number(e.target.value)})} />
                          </div>
                      )}
                   </div>

                   {/* Bio */}
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio / About</label>
                      <textarea className="w-full p-3 border rounded-xl h-32" rows={4} value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} />
                   </div>
                 </div>
              </div>

              {/* NEW: Clinics Management */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl">My Clinics</h3>
                    <AsyncButton 
                      onClick={() => setClinicModalOpen(true)} 
                      className="text-xs bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-gray-800 transition-colors"
                    >
                      <Plus size={12}/> Add Clinic
                    </AsyncButton>
                 </div>
                 
                 <div className="space-y-3">
                    {specialist.clinics?.length > 0 ? (
                      specialist.clinics.map((c: any) => (
                        <div key={c.id} className="p-4 border border-gray-200 rounded-xl flex items-center gap-4 hover:bg-gray-50 transition-colors">
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <Building2 className="text-blue-600" size={20} />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-sm text-gray-900">{c.name}</p>
                                <p className="text-xs text-gray-600">{c.address}</p>
                                <p className="text-xs text-gray-500 mt-1">{c.city}, {c.state} - {c.pincode}</p>
                            </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-xl">
                        <Building2 className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-gray-500 font-medium">No clinics added yet</p>
                        <p className="text-xs text-gray-400 mt-1">Add your first clinic to appear in patient searches</p>
                      </div>
                    )}
                 </div>
              </div>

              {/* Education Section */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl">Education</h3>
                    <AsyncButton 
                      onClick={() => addListItem("educations", { degree: "", college: "", year: "" })} 
                      className="text-xs bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-gray-800 transition-colors"
                    >
                      <Plus size={12}/> Add
                    </AsyncButton>
                 </div>
                 
                 {profileForm.educations.length === 0 ? (
                   <p className="text-gray-400 italic text-center py-4">No education details added yet.</p>
                 ) : (
                   <div className="space-y-3">
                     {profileForm.educations.map((edu: any, i: number) => (
                       <div key={i} className="flex gap-3 items-start">
                         <input 
                           placeholder="Degree (e.g. MBBS, BPT)" 
                           className="flex-1 p-3 border rounded-xl" 
                           value={edu.degree} 
                           onChange={e => updateList("educations", i, "degree", e.target.value)} 
                         />
                         <input 
                           placeholder="College/University" 
                           className="flex-1 p-3 border rounded-xl" 
                           value={edu.college} 
                           onChange={e => updateList("educations", i, "college", e.target.value)} 
                         />
                         <input 
                           placeholder="Year" 
                           className="w-24 p-3 border rounded-xl" 
                           value={edu.year} 
                           onChange={e => updateList("educations", i, "year", e.target.value)} 
                         />
                         <AsyncButton 
                           onClick={() => removeListItem("educations", i)} 
                           className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                         >
                           <Trash2 size={18}/>
                         </AsyncButton>
                       </div>
                     ))}
                   </div>
                 )}
              </div>

              {/* Awards Section */}
              <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl">Awards & Recognitions</h3>
                    <AsyncButton 
                      onClick={() => addListItem("awards", { name: "", year: "" })} 
                      className="text-xs bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-gray-800 transition-colors"
                    >
                      <Plus size={12}/> Add
                    </AsyncButton>
                 </div>
                 
                 {profileForm.awards.length === 0 ? (
                   <p className="text-gray-400 italic text-center py-4">No awards added yet.</p>
                 ) : (
                   <div className="space-y-3">
                     {profileForm.awards.map((award: any, i: number) => (
                       <div key={i} className="flex gap-3 items-start">
                         <input 
                           placeholder="Award Name" 
                           className="flex-1 p-3 border rounded-xl" 
                           value={award.name} 
                           onChange={e => updateList("awards", i, "name", e.target.value)} 
                         />
                         <input 
                           placeholder="Year" 
                           className="w-24 p-3 border rounded-xl" 
                           value={award.year} 
                           onChange={e => updateList("awards", i, "year", e.target.value)} 
                         />
                         <AsyncButton 
                           onClick={() => removeListItem("awards", i)} 
                           className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                         >
                           <Trash2 size={18}/>
                         </AsyncButton>
                       </div>
                     ))}
                   </div>
                 )}
              </div>

              {/* Save Button */}
              <div className="sticky bottom-4 bg-white p-4 rounded-2xl shadow-xl">
                 <AsyncButton 
                   onClick={handleUpdateProfile} 
                   className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-colors shadow-lg"
                 >
                    Save All Changes
                 </AsyncButton>
              </div>
           </div>
        )}
      </div>

      {/* --- MODAL: ADD CLINIC --- */}
      {clinicModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-slide-up">
              <AsyncButton onClick={() => setClinicModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full">
                <X size={20} className="text-gray-600" />
              </AsyncButton>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Building2 className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-xl">Add Clinic Location</h3>
                  <p className="text-sm text-gray-500">This will appear in patient searches</p>
                </div>
              </div>
              
              <div className="space-y-4">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Clinic Name</label>
                   <input 
                     placeholder="e.g. ReviveHub Clinic, Apollo Hospital" 
                     className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                     value={newClinic.name}
                     onChange={e => setNewClinic({...newClinic, name: e.target.value})} 
                   />
                 </div>
                 
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Full Address</label>
                   <textarea 
                     placeholder="Complete address with landmark" 
                     className="w-full p-3 border border-gray-200 rounded-xl h-24 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                     value={newClinic.address}
                     onChange={e => setNewClinic({...newClinic, address: e.target.value})}
                   />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-3">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">City</label>
                     <input 
                       placeholder="Gurgaon" 
                       className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                       value={newClinic.city}
                       onChange={e => setNewClinic({...newClinic, city: e.target.value})}
                     />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pincode</label>
                     <input 
                       placeholder="122001" 
                       className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all"
                       value={newClinic.pincode}
                       onChange={e => setNewClinic({...newClinic, pincode: e.target.value})}
                     />
                   </div>
                 </div>
                 
                 <div className="pt-4">
                   <AsyncButton 
                     onClick={handleAddClinic} 
                     className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-900 transition-colors flex items-center justify-center gap-2"
                   >
                     <Building2 size={18} />
                     Add Clinic Location
                   </AsyncButton>
                   <AsyncButton 
                     onClick={() => setClinicModalOpen(false)} 
                     className="w-full text-center py-3 text-gray-500 hover:text-gray-700 transition-colors"
                   >
                     Cancel
                   </AsyncButton>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- MODAL 1: SESSION MANAGER (Multi-Day Physio) --- */}
      {sessionModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl relative animate-slide-up">
              <AsyncButton onClick={() => setSessionModalOpen(false)} className="absolute top-4 right-4"><X size={20}/></AsyncButton>
              <h3 className="font-bold text-xl mb-4">Manage Sessions</h3>
              <p className="text-gray-500 text-sm mb-6">Patient: {selectedBooking.user.name}</p>
              
              {/* Progress Bar */}
              {(() => {
                 const total = selectedBooking.dailyLogs?.length || 1;
                 const done = selectedBooking.dailyLogs?.filter((l: any) => l.status === 'COMPLETED').length || 0;
                 const pct = (done / total) * 100;
                 return (
                    <div className="mb-6">
                        <div className="flex justify-between text-xs font-bold mb-1">
                            <span>Progress</span>
                            <span>{done}/{total} Sessions</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                        </div>
                    </div>
                 )
              })()}
              
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto custom-scrollbar">
                 {/* UPDATED: Added sorting */}
                 {selectedBooking.dailyLogs
                    ?.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((log: any, index: number) => (
                    <div key={log.id} className={`p-4 rounded-xl border flex justify-between items-center ${log.status === 'COMPLETED' ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                       <div>
                          <p className="font-bold text-sm">Day {index + 1}</p>
                          <p className="text-xs text-gray-500">{format(new Date(log.date), "dd MMM yyyy")}</p>
                       </div>
                       {log.status === 'COMPLETED' ? (
                          <span className="text-green-600 font-bold text-xs flex items-center gap-1"><CheckCircle size={12}/> Done</span>
                       ) : (
                          <AsyncButton onClick={() => markSessionDone(log.id)} className="text-xs bg-black text-white px-3 py-1.5 rounded-lg font-bold">Mark Done</AsyncButton>
                       )}
                    </div>
                 ))}
              </div>

              {/* Manual payment input */}
              {selectedBooking.paymentType === 'PAY_ON_SERVICE' && (
                 <div className="bg-yellow-50 p-4 rounded-xl mb-4 border border-yellow-100">
                    <p className="text-xs font-bold text-yellow-800 uppercase mb-2">Collect Payment (Optional)</p>
                    <div className="flex gap-2">
                       <span className="p-2 bg-yellow-100 rounded text-yellow-900 font-bold">₹</span>
                       <input 
                           type="number" 
                           placeholder="Enter amount collected today" 
                           className="flex-1 bg-transparent border-b-2 border-yellow-200 focus:border-yellow-600 outline-none font-bold text-yellow-900"
                           value={collectionAmount}
                           onChange={(e) => setCollectionAmount(e.target.value)}
                       />
                    </div>
                 </div>
              )}

              {/* If all logs are completed, offer Final Completion */}
              {selectedBooking.dailyLogs?.every((l: any) => l.status === 'COMPLETED') && (
                 <AsyncButton onClick={() => { setSessionModalOpen(false); setCompleteModalOpen(true); }} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold animate-pulse">
                    All Sessions Done &rarr; Create Final Report
                 </AsyncButton>
              )}
           </div>
        </div>
      )}

      {/* --- MODAL 2: COMPLETE / PRESCRIPTION WRITER --- */}
      {completeModalOpen && selectedBooking && (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
         <div className="bg-white p-8 rounded-xl w-full max-w-2xl h-[90vh] flex flex-col relative animate-slide-up shadow-2xl">
               
              {/* Header */}
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                 <div>
                    <h3 className="font-bold text-2xl text-gray-800">Prescription</h3>
                    <p className="text-sm text-gray-500">Generate official prescription for {selectedBooking.user?.name}</p>
                 </div>
                 <AsyncButton 
                    onClick={() => setCompleteModalOpen(false)} 
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                 >
                    <X size={24} className="text-gray-600"/>
                 </AsyncButton>
              </div>
               
              {/* Scrollable Form Area */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                 
                 {/* Diagnosis */}
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Diagnosis / Clinical Findings</label>
                    <input 
                          className="w-full p-4 border border-gray-200 rounded-lg font-medium focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all" 
                          placeholder="e.g. Viral Fever, Acute Back Pain" 
                          value={rxForm.diagnosis || ''}
                          onChange={e => setRxForm({...rxForm, diagnosis: e.target.value})} 
                    />
                 </div>

                 {/* Medicines */}
                 <div>
                    <div className="flex justify-between mb-2">
                          <label className="block text-xs font-bold text-gray-500 uppercase">Medicines (Rx)</label>
                          <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded border">Format: Name | Dosage | Duration</span>
                    </div>
                    <textarea 
                          className="w-full p-4 border border-gray-200 rounded-lg h-40 font-mono text-sm focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all" 
                          placeholder="Paracetamol 650mg | 1 tab after food | 3 Days&#10;Amoxicillin 500mg | 1 tab twice daily | 5 Days" 
                          value={rxForm.medicines || ''}
                          onChange={e => setRxForm({...rxForm, medicines: e.target.value})} 
                    />
                 </div>

                 {/* Advice */}
                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Advice / Instructions</label>
                    <textarea 
                          className="w-full p-4 border border-gray-200 rounded-lg h-32 focus:ring-2 focus:ring-black/5 focus:border-black outline-none transition-all" 
                          placeholder="- Drink plenty of warm water&#10;- Complete blood test (CBC)&#10;- Review after 3 days" 
                          value={rxForm.advice || ''}
                          onChange={e => setRxForm({...rxForm, advice: e.target.value})} 
                    />
                 </div>

                 {/* File Upload Section */}
                 <div className="border border-dashed border-gray-300 rounded-lg p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col items-center justify-center text-center">
                          {uploadedRxUrl ? (
                             <div className="text-green-600 flex flex-col items-center">
                                <CheckCircle size={32} className="mb-2"/>
                                <p className="font-medium">File Attached Successfully</p>
                                <p className="text-xs text-gray-500 mt-1">Ready to be included in report</p>
                             </div>
                          ) : (
                             <>
                                <UploadCloud className="text-gray-400 mb-3" size={32} />
                                <p className="text-sm font-medium text-gray-700">Upload Handwritten Note (Optional)</p>
                                <p className="text-xs text-gray-400 mb-4">PDF or Images only</p>
                                <input 
                                      type="file" 
                                      accept="application/pdf, image/*" 
                                      onChange={handleUpload} 
                                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 cursor-pointer" 
                                />
                                {isUploading && <p className="text-xs text-blue-600 mt-3 animate-pulse font-medium">Uploading...</p>}
                             </>
                          )}
                    </div>
                 </div>

                 {/* Payment Check (Conditional) */}
                 {selectedBooking.duration === 1 && selectedBooking.paymentType === 'PAY_ON_SERVICE' && (
                    <label className="flex items-center gap-4 p-4 border border-yellow-200 bg-yellow-50 rounded-lg cursor-pointer select-none">
                          <input type="checkbox" className="w-5 h-5 accent-black rounded" onChange={(e) => setCashCollectedCheck(e.target.checked)} />
                          <div>
                             <p className="font-bold text-sm text-yellow-900">Confirm Cash Payment</p>
                             <p className="text-xs text-yellow-700">Collect ₹{selectedBooking.totalPrice} from patient</p>
                          </div>
                    </label>
                 )}
              </div>

              {/* Footer Action */}
              <div className="pt-4 border-t mt-4">
                 <AsyncButton 
                    onClick={completeBooking} 
                    className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform active:scale-[0.99]"
                 >
                    <FileText size={20} />
                    Generate Prescription & Complete
                 </AsyncButton>
              </div>
         </div>
      </div>
   )}

      {/* --- MODAL 3: VIEW DETAILS --- */}
      {detailsModalOpen && selectedBooking && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto relative p-8 animate-slide-up">
               <AsyncButton onClick={() => setDetailsModalOpen(false)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></AsyncButton>
               
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                     {selectedBooking.user.name.charAt(0)}
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold">{selectedBooking.user.name}</h2>
                     <p className="text-gray-500">{selectedBooking.user.email || selectedBooking.user.phone}</p>
                  </div>
               </div>

               <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-5 rounded-2xl">
                     <p className="text-xs font-bold text-gray-400 uppercase mb-2">Visit Reason</p>
                     <p className="font-medium text-gray-800">{selectedBooking.medicalCondition || "Not specified"}</p>
                  </div>
                  <div className="bg-gray-50 p-5 rounded-2xl">
                     <p className="text-xs font-bold text-gray-400 uppercase mb-2">Attached Documents</p>
                     {selectedBooking.medicalDocs ? (
                     <a 
                        href={`/api/docs/view?url=${encodeURIComponent(selectedBooking.medicalDocs)}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 font-bold underline flex items-center gap-2"
                     >
                        <FileText size={16} /> View Secure Document
                     </a>
                     ) : <p className="text-gray-400 italic">No documents.</p>}
                  </div>
               </div>

               <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><div className="w-2 h-6 bg-red-500 rounded-full"></div> Health Vitals</h3>
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {selectedBooking.user.vitals?.length > 0 ? selectedBooking.user.vitals.map((v: any) => (
                     <div key={v.id} className="border border-gray-200 p-4 rounded-2xl text-center">
                        <p className="text-xs font-bold text-gray-400 uppercase mb-1">{v.type}</p>
                        <p className="font-bold text-lg text-gray-900">{v.value}</p>
                     </div>
                  )) : <p className="text-gray-400 italic col-span-4">No vitals recorded by patient.</p>}
               </div>
            </div>
         </div>
      )}

    </div>
  );
}