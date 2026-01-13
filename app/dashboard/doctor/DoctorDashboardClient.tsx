"use client";

import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import toast from "react-hot-toast";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Video, MapPin, Clock, CreditCard, FileText, CheckCircle, X } from "lucide-react";

const ALL_TIMES = [
  "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
];

export default function DoctorDashboardClient({ specialist }: any) {
  const router = useRouter();
  
  // Tab Persistence
  const [activeTab, setActiveTab] = useState("APPOINTMENTS");
  useEffect(() => {
    const saved = localStorage.getItem("doctorTab");
    if (saved) setActiveTab(saved);
  }, []);

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem("doctorTab", tab);
  };

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlotDate, setSelectedSlotDate] = useState<Date>(new Date());
  const [selectedSlotsForAction, setSelectedSlotsForAction] = useState<string[]>([]);
  
  // Modals
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  // Completion Forms
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [prescription, setPrescription] = useState("");
  const [cashCollectedCheck, setCashCollectedCheck] = useState(false);
  
  // Settings Forms
  const [bankForm, setBankForm] = useState(specialist.bankAccount || { accountHolder: "", accountNumber: "", bankName: "", ifscCode: "" });
  
  const [profileForm, setProfileForm] = useState({
    bio: specialist.bio,
    experience: specialist.experience,
    price: specialist.price,
    qualifications: specialist.qualifications,
    hospitals: specialist.hospitals,
    isVideoAvailable: specialist.isVideoAvailable,
    videoConsultationFee: specialist.videoConsultationFee
  });

  // Financials
  const totalRevenue = specialist.bookings.reduce((sum: number, b: any) => sum + b.totalPrice, 0);
  const cashCollected = specialist.bookings.filter((b: any) => b.paymentType === "PAY_ON_SERVICE").reduce((sum: number, b: any) => sum + (b.amountPaid || 0), 0);
  const onlineCollected = specialist.bookings.filter((b: any) => b.paymentType === "UPI_ONLINE" || b.paymentType === "ONLINE_ADVANCE").reduce((sum: number, b: any) => sum + b.amountPaid, 0);
  const totalCommission = Math.round((totalRevenue * specialist.commissionRate) / 100);
  const payoutEligibleAmount = onlineCollected - totalCommission;

  // --- ACTIONS ---

  // ✅ ADDED THIS MISSING FUNCTION
  const toggleSlotSelection = (time: string) => {
    if (selectedSlotsForAction.includes(time)) {
      setSelectedSlotsForAction(prev => prev.filter(t => t !== time));
    } else {
      setSelectedSlotsForAction(prev => [...prev, time]);
    }
  };

  const handleUpdateProfile = async () => {
    const loadingId = toast.loading("Updating...");
    try {
      const res = await fetch("/api/doctor/profile", {
        method: "PATCH",
        body: JSON.stringify(profileForm)
      });
      if(!res.ok) throw new Error();
      toast.success("Profile Updated", { id: loadingId });
      router.refresh();
    } catch { toast.error("Update failed", { id: loadingId }); }
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

  const verifyOtpAndComplete = async () => {
    // Validation
    if (selectedBooking.locationType !== 'VIDEO' && otpInput !== generatedOtp) return toast.error("Invalid OTP");
    if (!prescription || prescription.length < 10) return toast.error("Please write a prescription/note");

    let amount = 0;
    if (selectedBooking.paymentType === "PAY_ON_SERVICE") {
      if (!cashCollectedCheck) return toast.error("Confirm cash collection");
      amount = selectedBooking.totalPrice;
    }

    const toastId = toast.loading("Completing appointment...");
    try {
      await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        body: JSON.stringify({ 
            action: "UPDATE_STATUS", 
            status: "COMPLETED", 
            amountCollected: amount,
            prescription: prescription 
        }),
      });
      toast.success("Marked as Completed!", { id: toastId });
      setCompleteModalOpen(false);
      setPrescription("");
      router.refresh();
    } catch { toast.error("Error updating status", { id: toastId }); }
  };

  const calendarDays = useMemo(() => eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) }), [currentDate]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 mb-8 flex flex-col md:flex-row gap-6 shadow-sm items-center">
           <div className="relative w-24 h-24">
             <Image src={specialist.image || "/default-doctor.png"} alt="Profile" fill className="rounded-full object-cover border-4 border-gray-50" />
           </div>
           <div className="text-center md:text-left">
             <h1 className="text-3xl font-bold text-gray-900">Dr. {specialist.name}</h1>
             <p className="text-gray-500 font-medium">{specialist.category.replace("_", " ")}</p>
             <div className="flex gap-2 justify-center md:justify-start mt-2">
                {specialist.isVideoAvailable && <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold flex items-center gap-1"><Video size={12} /> Video Enabled</span>}
                <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold flex items-center gap-1"><Clock size={12} /> {specialist.experience} Yrs Exp</span>
             </div>
           </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
           {[
             { id: "APPOINTMENTS", label: "Appointments" },
             { id: "SLOTS", label: "Schedule" },
             { id: "FINANCIALS", label: "Earnings" },
             { id: "PROFILE", label: "Settings" }
           ].map(tab => (
             <button key={tab.id} onClick={() => changeTab(tab.id)} 
               className={`px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-black text-white shadow-lg" : "bg-white text-gray-500 hover:bg-gray-100"}`}>
               {tab.label}
             </button>
           ))}
           <button onClick={() => signOut()} className="ml-auto text-red-600 font-bold text-sm px-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors">Log Out</button>
        </div>

        {/* 1. APPOINTMENTS TAB */}
        {activeTab === "APPOINTMENTS" && (
          <div className="space-y-4">
            {specialist.bookings.length === 0 && (
                <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-gray-300">
                    <p className="text-gray-400 font-medium">No appointments scheduled yet.</p>
                </div>
            )}
            
            {specialist.bookings.map((b: any) => (
              <div key={b.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
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

                  <div className="flex items-center gap-4 text-xs font-bold">
                     <span className={`flex items-center gap-1 ${b.paymentType.includes('ONLINE') ? 'text-blue-600' : 'text-orange-600'}`}>
                        <CreditCard size={12} /> {b.paymentType.includes('ONLINE') ? 'PAID ONLINE' : 'CASH / UNPAID'}
                     </span>
                     {b.medicalCondition?.includes("UTR") && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">Ref: {b.medicalCondition}</span>
                     )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pl-4">
                   <button onClick={() => { setSelectedBooking(b); setDetailsModalOpen(true); }} className="w-full sm:w-auto px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                      View Details
                   </button>
                   
                   {b.status === "UPCOMING" && (
                      <>
                        {b.locationType === 'VIDEO' && (
                           <Link 
                             href={`/room/${b.id}`} 
                             target="_blank"
                             className="w-full sm:w-auto bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                           >
                              <Video size={16} /> Start Call
                           </Link>
                        )}
                        <button 
                            onClick={() => { 
                                setGeneratedOtp(Math.floor(1000 + Math.random() * 9000).toString()); 
                                setSelectedBooking(b); 
                                setCompleteModalOpen(true); 
                            }} 
                            className="w-full sm:w-auto bg-green-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                        >
                           Complete
                        </button>
                      </>
                   )}
                   {b.status === "COMPLETED" && (
                       <div className="flex items-center gap-1 text-green-600 font-bold px-4">
                           <CheckCircle size={18} /> Completed
                       </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. SCHEDULE & SLOTS TAB */}
        {activeTab === "SLOTS" && (
          <div className="grid lg:grid-cols-3 gap-8">
              {/* Calendar */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 h-fit">
                 <div className="flex justify-between mb-6 font-bold text-lg">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="hover:bg-gray-100 p-2 rounded-lg">←</button>
                    <span>{format(currentDate, "MMMM yyyy")}</span>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="hover:bg-gray-100 p-2 rounded-lg">→</button>
                 </div>
                 <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-xs font-bold text-gray-400">{d}</span>)}
                 </div>
                 <div className="grid grid-cols-7 gap-2 text-center">
                    {calendarDays.map(day => {
                      const isSelected = isSameDay(day, selectedSlotDate);
                      const hasBooking = specialist.bookings.some((b: any) => isSameDay(new Date(b.date), day) && b.status !== 'CANCELLED');
                      return (
                        <button key={day.toString()} onClick={() => setSelectedSlotDate(day)} 
                            className={`p-2 rounded-xl text-sm font-medium transition-all ${isSelected ? "bg-black text-white shadow-md" : "hover:bg-gray-50"} ${hasBooking ? "ring-2 ring-red-100 text-red-600" : ""}`}>
                          {format(day, "d")}
                        </button>
                      )
                    })}
                 </div>
              </div>

              {/* Slot Manager */}
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl">Availability for {format(selectedSlotDate, "dd MMM")}</h3>
                    <div className="flex gap-2">
                       <button onClick={() => handleBulkSlotAction("OPEN")} className="text-green-700 bg-green-50 text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-100">Mark Available</button>
                       <button onClick={() => handleBulkSlotAction("BLOCK")} className="text-red-700 bg-red-50 text-xs font-bold px-4 py-2 rounded-lg hover:bg-red-100">Mark Busy</button>
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
                         <button key={time} onClick={() => !isBooked && toggleSlotSelection(time)} disabled={isBooked} 
                            className={`p-4 rounded-xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${bgClass}`}>
                            {time}
                            <span className="text-[9px] uppercase font-extrabold opacity-70">{isBooked ? "Booked" : isBlocked ? "Blocked" : "Open"}</span>
                         </button>
                       )
                    })}
                 </div>
              </div>
          </div>
        )}

        {/* 3. FINANCIALS TAB */}
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
                 <div className="bg-black text-white p-6 border border-black rounded-2xl shadow-lg">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-1">Payout Pending</p>
                    <p className="font-bold text-2xl text-green-400">₹{payoutEligibleAmount}</p>
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
                    <button onClick={() => fetch("/api/doctor/bank", { method: "POST", body: JSON.stringify(bankForm) }).then(() => toast.success("Bank Saved"))} className="bg-black text-white px-6 py-3 rounded-xl font-bold">Save Bank Details</button>
                 </div>
              </div>
          </div>
        )}

        {/* 4. SETTINGS (PROFILE) TAB */}
        {activeTab === "PROFILE" && (
           <div className="bg-white p-8 rounded-3xl border border-gray-100 max-w-3xl">
              <h3 className="font-bold text-xl mb-6">Consultation Settings</h3>
              
              <div className="space-y-6">
                 {/* Video Toggle */}
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

                 <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bio / About</label>
                    <textarea className="w-full p-3 border rounded-xl" rows={4} value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} />
                 </div>

                 <button onClick={handleUpdateProfile} className="w-full bg-black text-white py-3 rounded-xl font-bold text-lg">Save Profile</button>
              </div>
           </div>
        )}
      </div>

      {/* --- MODAL: COMPLETE APPOINTMENT --- */}
      {completeModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl relative animate-slide-up">
              <button onClick={() => setCompleteModalOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
              
              <h3 className="font-bold text-2xl mb-1">Complete Appointment</h3>
              <p className="text-gray-500 text-sm mb-6">Patient: {selectedBooking.user.name}</p>
              
              <div className="space-y-5">
                 {/* UTR / Payment Check */}
                 <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Payment Status</p>
                    {selectedBooking.medicalCondition?.includes("UTR") ? (
                        <p className="font-mono font-bold text-lg">{selectedBooking.medicalCondition}</p>
                    ) : (
                        <p className="font-bold text-gray-900">{selectedBooking.paymentType === 'ONLINE_ADVANCE' ? 'Paid Online' : 'Pay at Clinic'}</p>
                    )}
                 </div>

                 {/* Prescription Writer */}
                 <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FileText size={16} /> Prescription & Notes
                    </label>
                    <textarea 
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-black outline-none min-h-[120px] text-sm"
                        placeholder="Write diagnosis, medicines (e.g. Paracetamol 500mg - 2x daily), and advice here..."
                        value={prescription}
                        onChange={(e) => setPrescription(e.target.value)}
                    />
                 </div>

                 {/* OTP Check (Only for Clinic) */}
                 {selectedBooking.locationType !== 'VIDEO' && (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Verify Patient Code</label>
                        <div className="flex gap-4 items-center">
                            <div className="bg-gray-100 px-4 py-2 rounded-lg font-mono font-bold text-gray-500 tracking-widest">{generatedOtp}</div>
                            <input 
                                className="flex-1 p-3 border-2 rounded-xl text-center font-bold tracking-widest outline-none focus:border-black"
                                placeholder="Enter Code"
                                maxLength={4}
                                value={otpInput}
                                onChange={(e) => setOtpInput(e.target.value)}
                            />
                        </div>
                    </div>
                 )}

                 {/* Cash Check */}
                 {selectedBooking.paymentType === 'PAY_ON_SERVICE' && (
                    <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer bg-yellow-50 border-yellow-100">
                        <input type="checkbox" className="w-5 h-5 accent-black" onChange={(e) => setCashCollectedCheck(e.target.checked)} />
                        <span className="font-bold text-sm text-yellow-900">I confirm receipt of ₹{selectedBooking.totalPrice}</span>
                    </label>
                 )}

                 <button onClick={verifyOtpAndComplete} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-200">
                    Submit & Complete
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* --- MODAL: VIEW DETAILS --- */}
      {detailsModalOpen && selectedBooking && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto relative p-8 animate-slide-up">
               <button onClick={() => setDetailsModalOpen(false)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
               
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
                        <a href={selectedBooking.medicalDocs} target="_blank" className="text-blue-600 font-bold underline flex items-center gap-2">
                           <FileText size={16} /> View Document
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