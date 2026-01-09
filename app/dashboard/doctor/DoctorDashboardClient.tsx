"use client";

import { useState, useEffect, useMemo } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import toast from "react-hot-toast";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// CONSTANT: Time Slots
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
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [showClinicModal, setShowClinicModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  // Forms & Inputs
  const [otpInput, setOtpInput] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [cashCollectedCheck, setCashCollectedCheck] = useState(false);
  const [clinicForm, setClinicForm] = useState({ name: "", address: "", city: "", state: "", pincode: "" });
  const [bankForm, setBankForm] = useState(specialist.bankAccount || { accountHolder: "", accountNumber: "", bankName: "", ifscCode: "" });
  
  // Profile Form
  const [profileForm, setProfileForm] = useState({
    bio: specialist.bio,
    experience: specialist.experience,
    price: specialist.price,
    qualifications: specialist.qualifications,
    hospitals: specialist.hospitals
  });

  // Financials
  const totalRevenue = specialist.bookings.reduce((sum: number, b: any) => sum + b.totalPrice, 0);
  const cashCollected = specialist.bookings.filter((b: any) => b.paymentType === "PAY_ON_SERVICE").reduce((sum: number, b: any) => sum + (b.amountPaid || 0), 0);
  const onlineCollected = specialist.bookings.filter((b: any) => b.paymentType === "ONLINE_ADVANCE").reduce((sum: number, b: any) => sum + b.amountPaid, 0);
  const totalCommission = Math.round((totalRevenue * specialist.commissionRate) / 100);
  const payoutEligibleAmount = onlineCollected - totalCommission;

  // --- ACTIONS ---

  // Profile Update
  const handleUpdateProfile = async () => {
    try {
      const res = await fetch("/api/doctor/profile", {
        method: "PATCH",
        body: JSON.stringify(profileForm)
      });
      if(!res.ok) throw new Error();
      toast.success("Profile Updated");
      router.refresh();
    } catch { toast.error("Update failed"); }
  };

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
    const toastId = toast.loading("Updating...");

    try {
      await Promise.all(selectedSlotsForAction.map(time => 
         fetch("/api/doctor/slots", {
            method: "POST",
            body: JSON.stringify({ date: dateStr, time, action }),
         })
      ));
      
      toast.success("Updated Successfully", { id: toastId });
      setSelectedSlotsForAction([]);
      router.refresh();
    } catch {
      toast.error("Failed", { id: toastId });
    }
  };

  const handleBlockEntireDate = async () => {
    const hasBookings = specialist.bookings.some((b: any) => isSameDay(new Date(b.date), selectedSlotDate) && b.status !== 'CANCELLED');
    
    if (hasBookings) {
       if (!confirm(`Warning: You have active bookings on ${format(selectedSlotDate, "dd MMM")}. Making this date unavailable will require you to cancel them manually. Proceed?`)) return;
    } else {
       if (!confirm(`Block ALL slots for ${format(selectedSlotDate, "dd MMM")}?`)) return;
    }
    
    const dateStr = format(selectedSlotDate, "yyyy-MM-dd");
    try {
      await Promise.all(ALL_TIMES.map(time => 
         fetch("/api/doctor/slots", {
            method: "POST",
            body: JSON.stringify({ date: dateStr, time, action: "BLOCK" }),
         })
      ));
      toast.success("Date blocked successfully");
      window.location.reload();
    } catch { toast.error("Failed"); }
  };

  const verifyOtpAndComplete = async () => {
    if (otpInput !== generatedOtp) return toast.error("Invalid OTP");
    
    let amount = 0;
    if (selectedBooking.paymentType === "PAY_ON_SERVICE") {
      if (!cashCollectedCheck) return toast.error("Confirm cash collection");
      // @ts-ignore
      amount = Number(document.getElementById("cashInput")?.value || 0);
    }

    try {
      await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "UPDATE_STATUS", status: "COMPLETED", amountCollected: amount }),
      });
      toast.success("Completed!");
      setOtpModalOpen(false);
      router.refresh();
    } catch { toast.error("Error"); }
  };

  // Generic Handlers
  const handleAddClinic = async () => {
    await fetch("/api/doctor/clinics", { method: "POST", body: JSON.stringify(clinicForm) });
    toast.success("Clinic Added");
    setShowClinicModal(false);
    router.refresh();
  };

  const handleSaveBank = async () => {
    await fetch("/api/doctor/bank", { method: "POST", body: JSON.stringify(bankForm) });
    toast.success("Bank Saved");
    setShowBankModal(false);
    router.refresh();
  };

  const handleRequestPayout = async () => {
    await fetch("/api/doctor/payout", { method: "POST", body: JSON.stringify({ amount: payoutEligibleAmount }) });
    toast.success("Request Sent");
    router.refresh();
  };

  const calendarDays = useMemo(() => eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) }), [currentDate]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border mb-6 flex gap-6 shadow-sm items-center">
           <div className="relative w-20 h-20">
             <Image src={specialist.image} alt="Profile" fill className="rounded-full object-cover" />
           </div>
           <div>
             <h1 className="text-2xl font-bold">Dr. {specialist.name}</h1>
             <p className="text-gray-500">{specialist.category}</p>
           </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
           {["APPOINTMENTS", "CLINICS", "SLOTS", "FINANCIALS", "PROFILE"].map(tab => (
             <button key={tab} onClick={() => changeTab(tab)} className={`px-6 py-2 rounded-full font-bold text-sm ${activeTab === tab ? "bg-black text-white" : "bg-white text-gray-600"}`}>
               {tab}
             </button>
           ))}
           <button onClick={() => signOut()} className="ml-auto text-red-600 font-bold text-sm px-4">Logout</button>
        </div>

        {/* 1. APPOINTMENTS */}
        {activeTab === "APPOINTMENTS" && (
          <div className="space-y-4">
            {specialist.bookings.length === 0 && <div className="bg-white p-10 text-center rounded-xl text-gray-500">No appointments found.</div>}
            
            {specialist.bookings.map((b: any) => (
              <div key={b.id} className="bg-white p-6 rounded-xl border flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <p className="font-bold text-lg">{b.user.name}</p>
                  <p className="text-sm text-gray-500">{format(new Date(b.date), "dd MMM")} • {b.slotTime} ({b.duration} Days)</p>
                  <p className={`text-xs font-bold mt-1 ${b.paymentType === 'ONLINE_ADVANCE' ? 'text-blue-600' : 'text-orange-600'}`}>
                    {b.paymentType === "ONLINE_ADVANCE" ? "Paid Online" : "Pay at Clinic"} (₹{b.totalPrice})
                  </p>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => { setSelectedBooking(b); setDetailsModalOpen(true); }} className="px-4 py-2 border rounded-lg text-sm font-bold">Details</button>
                   {b.status === "UPCOMING" && (
                     <button onClick={() => { setGeneratedOtp(Math.floor(1000 + Math.random() * 9000).toString()); setSelectedBooking(b); setOtpModalOpen(true); }} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">Complete</button>
                   )}
                   {b.status === "COMPLETED" && <span className="px-4 py-2 bg-gray-100 text-gray-500 font-bold rounded-lg text-sm">Completed</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. CLINICS */}
        {activeTab === "CLINICS" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {specialist.clinics.map((c: any) => (
                <div key={c.id} className="bg-white p-6 rounded-xl border shadow-sm">
                  <h3 className="font-bold text-lg">{c.name}</h3>
                  <p className="text-gray-500">{c.address}, {c.city}</p>
                </div>
              ))}
              <button onClick={() => setShowClinicModal(true)} className="w-full py-4 border-2 border-dashed font-bold text-gray-500">+ Add New Clinic</button>
            </div>
            {showClinicModal && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl w-96">
                   <h3 className="font-bold mb-4">Add Clinic</h3>
                   <input placeholder="Name" className="w-full border p-2 mb-2 rounded" onChange={e => setClinicForm({...clinicForm, name: e.target.value})} />
                   <input placeholder="Address" className="w-full border p-2 mb-2 rounded" onChange={e => setClinicForm({...clinicForm, address: e.target.value})} />
                   <div className="grid grid-cols-2 gap-2">
                      <input placeholder="City" className="w-full border p-2 mb-2 rounded" onChange={e => setClinicForm({...clinicForm, city: e.target.value})} />
                      <input placeholder="State" className="w-full border p-2 mb-2 rounded" onChange={e => setClinicForm({...clinicForm, state: e.target.value})} />
                   </div>
                   <input placeholder="Pincode" className="w-full border p-2 mb-2 rounded" onChange={e => setClinicForm({...clinicForm, pincode: e.target.value})} />
                   <button onClick={handleAddClinic} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Save</button>
                   <button onClick={() => setShowClinicModal(false)} className="w-full mt-2 text-gray-500">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. SLOTS */}
        {activeTab === "SLOTS" && (
          <div className="grid lg:grid-cols-3 gap-8">
             <div className="bg-white p-6 rounded-xl border h-fit">
                <div className="flex justify-between mb-4 font-bold">
                   <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}>←</button>
                   <span>{format(currentDate, "MMMM yyyy")}</span>
                   <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}>→</button>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center">
                   {calendarDays.map(day => {
                     const isSelected = isSameDay(day, selectedSlotDate);
                     const hasBooking = specialist.bookings.some((b: any) => isSameDay(new Date(b.date), day) && b.status !== 'CANCELLED');
                     return (
                       <button key={day.toString()} onClick={() => setSelectedSlotDate(day)} className={`p-2 rounded-full text-sm ${isSelected ? "bg-black text-white" : "hover:bg-gray-100"} ${hasBooking ? "border-b-2 border-red-500" : ""}`}>
                         {format(day, "d")}
                       </button>
                     )
                   })}
                </div>
             </div>

             <div className="lg:col-span-2 bg-white p-6 rounded-xl border">
                <div className="flex justify-between mb-6">
                   <h3 className="font-bold">Manage {format(selectedSlotDate, "dd MMM")}</h3>
                   <div className="flex gap-2">
                      <button onClick={() => handleBulkSlotAction("OPEN")} className="text-green-600 text-xs font-bold border px-3 py-1 rounded">Set Available</button>
                      <button onClick={() => handleBulkSlotAction("BLOCK")} className="text-red-600 text-xs font-bold border px-3 py-1 rounded">Set Unavailable</button>
                   </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                   {ALL_TIMES.map(time => {
                      const isBooked = specialist.bookings.some((b: any) => isSameDay(new Date(b.date), selectedSlotDate) && b.slotTime === time && b.status !== 'CANCELLED');
                      const isBlocked = specialist.slots.some((s: any) => isSameDay(new Date(s.date), selectedSlotDate) && s.startTime === time && s.isBooked);
                      const isSelected = selectedSlotsForAction.includes(time);
                      
                      let statusClass = "bg-white border-green-200 text-green-700";
                      if (isBooked) statusClass = "bg-red-50 border-red-200 text-red-700 opacity-50";
                      else if (isBlocked) statusClass = "bg-gray-100 border-gray-300 text-gray-400";
                      if (isSelected) statusClass = "border-blue-600 ring-1 ring-blue-200";

                      return (
                        <button key={time} onClick={() => !isBooked && toggleSlotSelection(time)} disabled={isBooked} className={`p-3 rounded-xl border-2 font-bold text-xs ${statusClass}`}>
                           {time}
                           <div className="text-[9px] mt-1">{isBooked ? "BOOKED" : isBlocked ? "BLOCKED" : "OPEN"}</div>
                        </button>
                      )
                   })}
                </div>
                <div className="mt-6 flex justify-end">
                   <button onClick={handleBlockEntireDate} className="text-red-600 text-xs font-bold border border-red-200 px-3 py-1 rounded">Block Entire Date</button>
                </div>
             </div>
          </div>
        )}

        {/* 4. FINANCIALS */}
        {activeTab === "FINANCIALS" && (
          <div className="space-y-6">
             <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 border rounded-xl"><p className="text-xs text-gray-500">Sales</p><p className="font-bold text-xl">₹{totalRevenue}</p></div>
                <div className="bg-white p-4 border rounded-xl"><p className="text-xs text-gray-500">Cash</p><p className="font-bold text-xl text-orange-600">₹{cashCollected}</p></div>
                <div className="bg-white p-4 border rounded-xl"><p className="text-xs text-gray-500">Online</p><p className="font-bold text-xl text-blue-600">₹{onlineCollected}</p></div>
                <div className="bg-white p-4 border rounded-xl"><p className="text-xs text-gray-500">Payout</p><p className="font-bold text-xl text-green-600">₹{payoutEligibleAmount}</p></div>
             </div>
             <div className="bg-white p-6 border rounded-xl flex justify-between">
                <p>Bank: {specialist.bankAccount ? specialist.bankAccount.accountNumber : "Not Added"}</p>
                <button onClick={() => setShowBankModal(true)} className="text-blue-600 font-bold text-sm">Edit</button>
             </div>
             {showBankModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                   <div className="bg-white p-6 rounded-xl w-96 space-y-2">
                      <h3 className="font-bold">Bank Details</h3>
                      <input placeholder="Account Holder" className="w-full border p-2 rounded" value={bankForm.accountHolder} onChange={e => setBankForm({...bankForm, accountHolder: e.target.value})} />
                      <input placeholder="Account Number" className="w-full border p-2 rounded" value={bankForm.accountNumber} onChange={e => setBankForm({...bankForm, accountNumber: e.target.value})} />
                      <input placeholder="Bank Name" className="w-full border p-2 rounded" value={bankForm.bankName} onChange={e => setBankForm({...bankForm, bankName: e.target.value})} />
                      <input placeholder="IFSC" className="w-full border p-2 rounded" value={bankForm.ifscCode} onChange={e => setBankForm({...bankForm, ifscCode: e.target.value})} />
                      <button onClick={handleSaveBank} className="w-full bg-blue-600 text-white py-2 rounded font-bold">Save</button>
                      <button onClick={() => setShowBankModal(false)} className="w-full text-gray-500 mt-2">Cancel</button>
                   </div>
                </div>
             )}
             <div className="bg-gray-900 text-white p-8 rounded-xl flex justify-between items-center shadow-lg">
                <div>
                   <p className="text-sm opacity-80 uppercase font-bold">Eligible Payout</p>
                   <p className={`text-3xl font-bold ${payoutEligibleAmount > 0 ? "text-green-400" : "text-red-400"}`}>₹{payoutEligibleAmount}</p>
                </div>
                {payoutEligibleAmount > 0 && <button onClick={handleRequestPayout} className="bg-green-600 px-8 py-3 rounded-xl font-bold shadow-lg">Request Payout</button>}
             </div>
          </div>
        )}

        {/* 5. PROFILE TAB */}
        {activeTab === "PROFILE" && (
           <div className="bg-white p-8 rounded-xl border max-w-2xl">
              <h3 className="font-bold text-xl mb-6">Edit Profile</h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Bio</label>
                    <textarea className="w-full p-2 border rounded" rows={3} value={profileForm.bio} onChange={e => setProfileForm({...profileForm, bio: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-sm font-bold text-gray-600 mb-1">Price (₹)</label>
                       <input type="number" className="w-full p-2 border rounded" value={profileForm.price} onChange={e => setProfileForm({...profileForm, price: Number(e.target.value)})} />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-gray-600 mb-1">Experience (Years)</label>
                       <input type="number" className="w-full p-2 border rounded" value={profileForm.experience} onChange={e => setProfileForm({...profileForm, experience: Number(e.target.value)})} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Qualifications</label>
                    <input className="w-full p-2 border rounded" value={profileForm.qualifications} onChange={e => setProfileForm({...profileForm, qualifications: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">Hospitals</label>
                    <input className="w-full p-2 border rounded" value={profileForm.hospitals} onChange={e => setProfileForm({...profileForm, hospitals: e.target.value})} />
                 </div>
                 <button onClick={handleUpdateProfile} className="bg-blue-600 text-white px-6 py-2 rounded font-bold mt-2">Save Changes</button>
              </div>
           </div>
        )}

      </div>

      {/* --- MODALS --- */}
      {/* 1. OTP Modal */}
      {otpModalOpen && selectedBooking && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
           <div className="bg-white p-8 rounded-2xl w-full max-w-sm shadow-2xl">
              <h3 className="font-bold text-xl mb-4 text-center">Verify Patient</h3>
              <p className="text-center text-4xl font-mono font-bold text-blue-600 mb-4 tracking-widest">{generatedOtp}</p>
              <input value={otpInput} onChange={(e) => setOtpInput(e.target.value)} maxLength={4} className="w-full text-center text-3xl font-bold border-b-2 mb-6 py-2 outline-none" placeholder="0000" />
              {selectedBooking.paymentType === "PAY_ON_SERVICE" && (
                 <div className="bg-yellow-50 p-4 rounded-xl mb-6 border border-yellow-100">
                    <label className="flex items-center gap-3 font-bold text-sm">
                       <input type="checkbox" className="accent-black" onChange={(e) => setCashCollectedCheck(e.target.checked)} />
                       I collected Cash Payment
                    </label>
                    {cashCollectedCheck && <input id="cashInput" type="number" defaultValue={selectedBooking.totalPrice} className="mt-2 w-full p-2 border rounded font-bold" />}
                 </div>
              )}
              <button onClick={verifyOtpAndComplete} className="w-full bg-black text-white py-3 rounded-xl font-bold">Verify & Complete</button>
              <button onClick={() => setOtpModalOpen(false)} className="w-full text-gray-400 text-sm font-bold mt-4">Cancel</button>
           </div>
        </div>
      )}

      {/* 2. Details Modal */}
      {detailsModalOpen && selectedBooking && (
         <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl h-[80vh] overflow-y-auto relative p-8">
               <button onClick={() => setDetailsModalOpen(false)} className="absolute top-4 right-4 text-2xl text-gray-400">✕</button>
               <h2 className="text-2xl font-bold mb-4">{selectedBooking.user.name}</h2>
               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                     <p className="text-xs font-bold text-gray-400 uppercase">Medical Condition</p>
                     <p>{selectedBooking.medicalCondition || "None"}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                     <p className="text-xs font-bold text-gray-400 uppercase">Uploaded Docs</p>
                     {selectedBooking.medicalDocs ? <a href={selectedBooking.medicalDocs} target="_blank" className="text-blue-700 underline font-bold">View Uploaded File ↗</a> : <p className="text-gray-400">No files uploaded.</p>}
                  </div>
               </div>
               <h3 className="font-bold mb-3">Vitals History</h3>
               <div className="grid grid-cols-3 gap-3">
                  {selectedBooking.user.vitals?.length > 0 ? selectedBooking.user.vitals.map((v: any) => (
                     <div key={v.id} className="border p-3 rounded-lg text-center">
                        <p className="text-xs text-gray-400">{v.type}</p>
                        <p className="font-bold">{v.value}</p>
                     </div>
                  )) : <p className="text-gray-400 text-sm col-span-3">No vitals recorded.</p>}
               </div>
            </div>
         </div>
      )}

    </div>
  );
}