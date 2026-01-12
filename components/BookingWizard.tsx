"use client";

import { useState, useEffect } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { X, ChevronLeft, CheckCircle, Loader2, Building2, CreditCard, Banknote } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { generateVideoSlots, generateHomeSlots, generateClinicSlots } from "@/lib/slots";

export default function BookingWizard({ 
  isOpen, onClose, specialist, mode, user 
}: any) {
  const router = useRouter();
  
  // --- STATE ---
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedClinicId, setSelectedClinicId] = useState(""); 
  const [patientId, setPatientId] = useState("SELF");
  const [address, setAddress] = useState("");
  const [homeDays, setHomeDays] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Payment States
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH">("ONLINE");
  const [transactionId, setTransactionId] = useState("");

  // --- INITIALIZATION ---
  useEffect(() => { 
    if(isOpen) {
      setStep(1);
      setTransactionId("");
      // Default to Online
      setPaymentMethod("ONLINE");
      // Auto-select clinic if only one exists
      if(mode === 'CLINIC' && specialist.clinics?.length === 1) {
        setSelectedClinicId(specialist.clinics[0].id);
      }
    } 
  }, [isOpen, mode, specialist]);

  // Pricing & Slots
  const slots = mode === 'VIDEO' ? generateVideoSlots() : mode === 'HOME' ? generateHomeSlots() : generateClinicSlots();
  const dateStrip = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
  const basePrice = mode === 'VIDEO' ? (specialist.videoConsultationFee || specialist.price) : specialist.price;
  const totalPrice = basePrice * (mode === 'HOME' ? homeDays : 1);

  // --- HANDLERS ---
  const handleNext = () => {
    // Validation Step 1
    if (step === 1) {
      if (mode === 'CLINIC' && !selectedClinicId) return toast.error("Please select a clinic location");
      if (!selectedSlot) return toast.error("Please select a time slot");
    }
    // Validation Step 2
    if (step === 2) {
      if (mode === 'HOME' && !address) return toast.error("Home address is required");
    }
    setStep(step + 1);
  };

  const handleBook = async () => {
    // Validation: Require UTR only if Paying Online
    if (paymentMethod === "ONLINE" && (!transactionId || transactionId.length < 5)) {
      return toast.error("Please enter a valid Payment Reference / UTR");
    }

    setLoading(true);
    try {
      const payload = {
        userId: user.id,
        specialistId: specialist.id,
        date: selectedDate,
        slotTime: selectedSlot,
        totalPrice,
        locationType: mode,
        visitAddress: address,
        duration: homeDays,
        clinicId: mode === 'CLINIC' ? Number(selectedClinicId) : null,
        familyMemberId: patientId === "SELF" ? null : Number(patientId),
        
        // Dynamic Payment Data
        paymentType: paymentMethod === "ONLINE" ? "UPI_ONLINE" : "PAY_ON_SERVICE",
        amountPaid: paymentMethod === "ONLINE" ? totalPrice : 0,
        transactionId: paymentMethod === "ONLINE" ? transactionId : null
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Booking failed");
      
      const successMsg = paymentMethod === "ONLINE" 
        ? "Payment sent for verification!" 
        : "Booking Confirmed! Pay at clinic.";
        
      toast.success(successMsg);
      router.push("/dashboard/user");
      router.refresh(); // Refresh to show new booking
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-t-[30px] shadow-2xl h-[85vh] flex flex-col animate-slide-up relative">
        
        {/* HEADER */}
        <div className="p-5 border-b flex items-center justify-between bg-white rounded-t-[30px]">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
              <ChevronLeft />
            </button>
          ) : (
             <div className="w-10" /> 
          )}
          <h3 className="font-bold text-lg">
            {step === 1 && (mode === 'CLINIC' ? "Location & Time" : "Select Slot")}
            {step === 2 && "Patient Details"}
            {step === 3 && "Payment"}
          </h3>
          <button onClick={onClose} className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 rounded-full"><X /></button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          
          {/* STEP 1: CLINIC (If Applicable) + DATE + TIME */}
          {step === 1 && (
            <div className="space-y-6">
              
              {/* Clinic Selector */}
              {mode === 'CLINIC' && (
                 <div>
                   <p className="text-xs font-bold text-gray-400 uppercase mb-3">Select Clinic</p>
                   <div className="space-y-2">
                     {specialist.clinics?.length > 0 ? specialist.clinics.map((c: any) => (
                       <button key={c.id} onClick={() => setSelectedClinicId(c.id)}
                         className={`w-full p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${selectedClinicId === c.id ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "border-gray-200"}`}
                       >
                         <Building2 className="text-gray-500" />
                         <div>
                           <p className="font-bold text-sm">{c.name}</p>
                           <p className="text-xs text-gray-500">{c.city}, {c.state}</p>
                         </div>
                       </button>
                     )) : (
                       <p className="text-sm text-red-500">No clinics found for this doctor.</p>
                     )}
                   </div>
                 </div>
              )}

              {/* Date Strip */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase mb-3">Select Date</p>
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                   {dateStrip.map((date) => (
                     <button key={date.toString()} onClick={() => setSelectedDate(date)} className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center border transition-all ${isSameDay(date, selectedDate) ? "bg-black text-white scale-105" : "border-gray-200"}`}>
                        <span className="text-xs font-bold">{format(date, "EEE")}</span>
                        <span className="text-xl font-bold">{format(date, "d")}</span>
                     </button>
                   ))}
                </div>
              </div>

              {/* Time Slots */}
              <div>
                 <p className="text-xs font-bold text-gray-400 uppercase mb-3">Select Time</p>
                 <div className="grid grid-cols-3 gap-3">
                   {slots.map((slot) => (
                     <button key={slot} onClick={() => setSelectedSlot(slot)} className={`py-3 rounded-xl text-sm font-bold border transition-all ${selectedSlot === slot ? "bg-blue-600 text-white shadow-md" : "border-gray-200"}`}>{slot}</button>
                   ))}
                 </div>
              </div>
            </div>
          )}

          {/* STEP 2: PATIENT & ADDRESS */}
          {step === 2 && (
             <div className="space-y-4">
                <p className="font-bold text-gray-500 text-xs uppercase">Who is this for?</p>
                
                {/* Self Selection */}
                <div onClick={() => setPatientId("SELF")} className={`p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition-all ${patientId === "SELF" ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "hover:bg-gray-50"}`}>
                   <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold">{user.name?.charAt(0)}</div>
                   <div className="flex-1 font-bold">Myself</div>
                   {patientId === "SELF" && <CheckCircle className="text-blue-600" size={18} />}
                </div>

                {/* Family Selection */}
                {user.familyMembers?.map((m: any) => (
                   <div key={m.id} onClick={() => setPatientId(String(m.id))} className={`p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition-all ${patientId === String(m.id) ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" : "hover:bg-gray-50"}`}>
                      <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center text-xs font-bold">{m.name.charAt(0)}</div>
                      <div className="flex-1 font-bold">{m.name} <span className="text-gray-400 font-normal text-xs">({m.relation})</span></div>
                      {patientId === String(m.id) && <CheckCircle className="text-blue-600" size={18} />}
                   </div>
                ))}

                {/* Home Address Input */}
                {mode === 'HOME' && (
                  <div className="pt-2 animate-fade-in">
                    <p className="font-bold text-gray-500 text-xs uppercase mb-2">Visit Address</p>
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter complete address..." className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none h-24" />
                    <div className="mt-4">
                        <p className="font-bold text-gray-500 text-xs uppercase mb-2">Duration: {homeDays} Day(s)</p>
                        <input type="range" min="1" max="7" value={homeDays} onChange={(e) => setHomeDays(Number(e.target.value))} className="w-full accent-green-600"/>
                    </div>
                  </div>
                )}
             </div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Total Payable</p>
                <h1 className="text-4xl font-bold text-gray-900">₹{totalPrice}</h1>
              </div>

              {/* Method Selection */}
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPaymentMethod("ONLINE")}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === "ONLINE" ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-100 text-gray-500"}`}
                >
                  <CreditCard size={24} />
                  <span className="font-bold text-sm">Pay Now</span>
                </button>

                <button 
                  onClick={() => mode !== 'VIDEO' && setPaymentMethod("CASH")}
                  disabled={mode === 'VIDEO'}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    mode === 'VIDEO' ? "opacity-40 cursor-not-allowed bg-gray-50" : 
                    paymentMethod === "CASH" ? "border-green-600 bg-green-50 text-green-700" : "border-gray-100 text-gray-500"
                  }`}
                >
                  <Banknote size={24} />
                  <span className="font-bold text-sm">Pay Later</span>
                  {mode === 'VIDEO' && <span className="text-[9px] text-red-500 font-bold">Prepaid Only</span>}
                </button>
              </div>

              {/* Conditional UI */}
              {paymentMethod === "ONLINE" ? (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center animate-fade-in">
                   <p className="text-xs font-bold text-blue-600 uppercase mb-3">Scan UPI QR</p>
                   <div className="w-40 h-40 bg-white mx-auto p-2 rounded-lg mb-4 border border-dashed border-gray-300">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=care@revivehub.co.in&pn=ReviveHub&am=${totalPrice}&cu=INR`} alt="QR" className="w-full h-full object-contain" />
                   </div>
                   <input 
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter UTR / Ref No."
                      className="w-full p-3 border rounded-xl text-center font-mono tracking-widest focus:ring-2 focus:ring-blue-600 outline-none"
                      maxLength={12}
                   />
                   <p className="text-[10px] text-gray-500 mt-2">Enter the 12-digit UTR from your payment app.</p>
                </div>
              ) : (
                <div className="bg-green-50 p-6 rounded-xl border border-green-100 text-center animate-fade-in">
                   <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <CheckCircle size={24} />
                   </div>
                   <h3 className="font-bold text-green-800">Pay at Service</h3>
                   <p className="text-xs text-green-600 mt-1">Please pay ₹{totalPrice} directly to the doctor via Cash or UPI.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t bg-white">
           <button onClick={step < 3 ? handleNext : handleBook} disabled={loading} className="w-full py-4 bg-black text-white font-bold rounded-xl text-lg hover:scale-[1.01] transition-transform flex items-center justify-center gap-2">
             {loading ? <Loader2 className="animate-spin" /> : (step < 3 ? "Continue" : (paymentMethod === "ONLINE" ? "Verify & Book" : "Confirm Booking"))}
           </button>
        </div>

      </div>
    </div>
  );
}