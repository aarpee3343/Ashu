"use client";

import { useSession, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { format, addHours, isBefore, parse } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import AsyncButton from "@/components/ui/AsyncButton";
import { MapPin, Home, Video, Building2, Clock } from "lucide-react";

export default function BookingPaymentModal({ 
  isOpen, onClose, specialist, date, slot, initialMode = "CLINIC" 
}: any) {
  const { data: session } = useSession();
  const router = useRouter();
  
  // State
  const [locationType, setLocationType] = useState(initialMode);
  
  // "duration" means:
  // - For Video: Total Minutes (15, 30, 45, 60)
  // - For Home: Number of 1-Hour Sessions (1, 2, 3...)
  // - For Clinic: Always 1
  const [duration, setDuration] = useState(1); 
  
  // --- PRICE & LABEL CALCULATION ---
  let finalPrice = 0;
  let durationDisplay = "";
  let rateDisplay = "";

  if (locationType === "VIDEO") {
     const baseVideoFee = specialist.videoConsultationFee || specialist.price;
     // If duration is in minutes (15, 30...), calculate blocks
     const blocks = duration / 15; 
     finalPrice = baseVideoFee * blocks;
     durationDisplay = `${duration} Mins`;
     rateDisplay = `₹${baseVideoFee} / 15 mins`;
  } 
  else if (locationType === "HOME") {
     // Home Visit: Base Price * Number of Sessions
     finalPrice = specialist.price * duration;
     durationDisplay = `${duration} Session${duration > 1 ? 's' : ''} (${duration} Hr)`;
     rateDisplay = `₹${specialist.price} / 1 hour`;
  } 
  else {
     // Clinic: Fixed Price
     finalPrice = specialist.price;
     durationDisplay = "Standard Visit";
     rateDisplay = `₹${specialist.price} flat fee`;
  }

  // Other State
  const [step, setStep] = useState(1); 
  const [medicalCondition, setMedicalCondition] = useState("");
  const [medicalDocs, setMedicalDocs] = useState(""); 
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [homeAddress, setHomeAddress] = useState(""); 
  const [paymentMode, setPaymentMode] = useState<"SERVICE" | "ONLINE">("SERVICE");
  const [advancePercent, setAdvancePercent] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if(isOpen) {
        setLocationType(initialMode);
        // Default values based on mode
        setDuration(initialMode === "VIDEO" ? 15 : 1);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // --- 1. LOGIN CHECK ---
  if (!session) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🔒</div>
          <h3 className="text-xl font-bold mb-2">Login Required</h3>
          <p className="text-gray-500 mb-6">Please login to confirm your booking.</p>
          <AsyncButton onClick={() => signIn()} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700">Login</AsyncButton>
          <AsyncButton onClick={onClose} className="mt-4 text-sm text-gray-500 hover:text-gray-900">Cancel</AsyncButton>
        </div>
      </div>
    );
  }

  // --- 2. PAYMENT & QR ---
  const payNowAmount = paymentMode === "SERVICE" ? 0 : Math.round((finalPrice * advancePercent) / 100);
  const qrApiBase = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=";
  const qrData = `upi://pay?pa=healthplatform@upi&pn=Health&am=${payNowAmount}&cu=INR`;

  // --- 3. FILE UPLOAD ---
  const handleFileUpload = async (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  const toastId = toast.loading("Uploading document...");

  try {
    // Call the new Vercel Blob API
    const response = await fetch(`/api/upload?filename=${file.name}`, {
      method: 'POST',
      body: file,
    });

    const newBlob = await response.json();

    if (newBlob.url) {
      setMedicalDocs(newBlob.url); // Save the public URL to state
      toast.success("Attached successfully!", { id: toastId });
    } else {
      throw new Error("Upload failed");
    }
  } catch (error) {
    toast.error("Upload failed", { id: toastId });
  }
};

  // --- 4. CONFIRM BOOKING ---
  const handleConfirmBooking = async () => {
    if (!session || !session.user) return toast.error("You must be logged in.");
    if (locationType === "HOME" && !homeAddress) return toast.error("Enter home address");
    if (locationType === "CLINIC" && !selectedClinicId) return toast.error("Select a clinic");

    setIsProcessing(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          userId: (session.user as any).id,
          specialistId: specialist.id,
          date: date,
          slotTime: slot,
          totalPrice: finalPrice,
          amountPaid: payNowAmount,
          paymentType: paymentMode === "SERVICE" ? "PAY_ON_SERVICE" : "ONLINE_ADVANCE",
          // Send duration logic
          duration: duration, 
          locationType: locationType,
          visitAddress: locationType === 'HOME' ? homeAddress : null,
          clinicId: locationType === 'CLINIC' ? selectedClinicId : null,
          medicalCondition: medicalCondition,
          medicalDocs: medicalDocs
        }),
      });

      if (!res.ok) throw new Error("Booking failed");

      toast.success("Booking Confirmed!");
      router.push("/dashboard/user");
      router.refresh();
      onClose();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4">
      <div className="bg-white w-full sm:rounded-2xl sm:max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh] rounded-t-2xl animate-slide-up">
        
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center sticky top-0 z-10">
          <h3 className="font-bold text-lg">
            {step === 1 ? "Booking Details" : "Review & Pay"}
          </h3>
          <AsyncButton onClick={onClose} className="p-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">✕</AsyncButton>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Summary Card */}
          <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
               <div>
                  <div className="font-bold text-gray-900">{specialist.name}</div>
                  <div className="flex items-center gap-1 text-xs text-blue-700 font-semibold mt-1">
                    <Clock size={12} /> {durationDisplay}
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-lg font-bold text-blue-800">₹{finalPrice}</div>
                  <div className="text-[10px] text-blue-600">{rateDisplay}</div>
               </div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-blue-200">
               <span className="text-xs text-gray-500 font-medium">Slot</span>
               <span className="text-xs font-bold text-gray-800">{format(new Date(date), "d MMM")} • {slot}</span>
            </div>
          </div>

          {/* STEP 1: DETAILS */}
          {step === 1 && (
            <div className="space-y-6">
               
               {/* --- LOCATION TOGGLE --- */}
               {initialMode !== "VIDEO" ? (
                 <div className="grid grid-cols-3 bg-gray-100 p-1 rounded-xl">
                     <AsyncButton 
                       onClick={() => { setLocationType("CLINIC"); setDuration(1); }}
                       className={`py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all ${locationType === "CLINIC" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                     >
                       <Building2 size={16} /> Clinic
                     </AsyncButton>
                     <AsyncButton 
                       onClick={() => { setLocationType("HOME"); setDuration(1); }}
                       className={`py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all ${locationType === "HOME" ? "bg-white shadow text-green-600" : "text-gray-500 hover:text-gray-700"}`}
                     >
                       <Home size={16} /> Home
                     </AsyncButton>
                     {specialist.isVideoAvailable && (
                       <AsyncButton 
                         onClick={() => { setLocationType("VIDEO"); setDuration(15); }}
                         className={`py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all ${locationType === "VIDEO" ? "bg-white shadow text-purple-600" : "text-gray-500 hover:text-gray-700"}`}
                       >
                         <Video size={16} /> Video
                       </AsyncButton>
                     )}
                 </div>
               ) : (
                 <div className="p-3 bg-purple-50 text-purple-700 text-center font-bold rounded-xl border border-purple-100 flex items-center justify-center gap-2">
                    <Video size={18} /> Video Consultation Selected
                 </div>
               )}

               {/* --- DURATION CONTROLS --- */}
               
               {/* 1. VIDEO: Mins Selector */}
               {locationType === "VIDEO" && (
                  <div className="animate-fade-in">
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Select Duration</label>
                    <div className="grid grid-cols-4 gap-2">
                       {[15, 30, 45, 60].map((mins) => (
                          <AsyncButton key={mins} onClick={() => setDuration(mins)} className={`py-2 rounded-lg text-sm font-bold border transition-all ${duration === mins ? "bg-purple-600 text-white border-purple-600 shadow-md" : "bg-white text-gray-600 hover:border-purple-300"}`}>{mins}m</AsyncButton>
                       ))}
                    </div>
                  </div>
               )}

               {/* 2. HOME: Session Counter */}
               {locationType === "HOME" && (
                  <div className="animate-fade-in bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wide">Number of 1-Hour Sessions</label>
                    <div className="flex items-center justify-between">
                       <AsyncButton onClick={() => setDuration(Math.max(1, duration - 1))} className="w-10 h-10 rounded-full bg-white border border-gray-200 font-bold hover:bg-gray-100 text-lg shadow-sm">-</AsyncButton>
                       <div className="text-center">
                          <span className="block font-bold text-2xl text-gray-900">{duration}</span>
                          <span className="text-xs text-gray-500">Session{duration > 1 ? 's' : ''}</span>
                       </div>
                       <AsyncButton onClick={() => setDuration(duration + 1)} className="w-10 h-10 rounded-full bg-white border border-gray-200 font-bold hover:bg-gray-100 text-lg shadow-sm">+</AsyncButton>
                    </div>
                  </div>
               )}

               {/* --- ADDRESS & CLINIC FIELDS --- */}
               
               {locationType === "CLINIC" && (
                 <div className="animate-fade-in">
                   <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Select Clinic Location</label>
                   <div className="relative">
                     <Building2 className="absolute left-3 top-3.5 text-gray-400" size={18} />
                     <select 
                       className="w-full pl-10 p-3 border border-gray-300 rounded-xl outline-none bg-white focus:ring-2 focus:ring-blue-100 appearance-none"
                       onChange={(e) => setSelectedClinicId(e.target.value)}
                       value={selectedClinicId}
                     >
                       <option value="">-- Choose a Clinic --</option>
                       {specialist.clinics?.map((c: any) => (
                         <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                       ))}
                     </select>
                   </div>
                 </div>
               )}

               {locationType === "HOME" && (
                 <div className="animate-fade-in">
                   <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Home Address</label>
                   <div className="relative">
                     <MapPin className="absolute left-3 top-3.5 text-gray-400" size={18} />
                     <textarea 
                       className="w-full pl-10 p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-100 min-h-[80px]"
                       rows={2}
                       placeholder="Enter full address, landmark & pincode..."
                       value={homeAddress}
                       onChange={(e) => setHomeAddress(e.target.value)}
                     />
                   </div>
                 </div>
               )}

               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Reason for Visit</label>
                 <textarea 
                   className="w-full p-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-gray-200" 
                   rows={2}
                   placeholder="Describe symptoms briefly..."
                   value={medicalCondition}
                   onChange={(e) => setMedicalCondition(e.target.value)}
                 />
               </div>

               <div>
                 <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Upload Reports (Optional)</label>
                 <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer relative bg-white">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                    <p className="text-sm text-blue-600 font-bold">Click to Upload</p>
                    <p className="text-xs text-gray-400 mt-1">{medicalDocs ? "File Attached ✅" : "PDF or Images"}</p>
                 </div>
               </div>
            </div>
          )}

          {/* STEP 2: PAYMENT */}
          {step === 2 && (
            <div className="space-y-4">
              <label className="block font-bold mb-2">Payment Mode</label>
              
              <div onClick={() => setPaymentMode("SERVICE")} className={`p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${paymentMode === "SERVICE" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMode === "SERVICE" ? "border-blue-600" : "border-gray-300"}`}>
                  {paymentMode === "SERVICE" && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                </div>
                <div>
                  <p className="font-bold text-sm">Pay Later</p>
                  <p className="text-xs text-gray-500">Pay full amount after service.</p>
                </div>
              </div>

              <div onClick={() => setPaymentMode("ONLINE")} className={`p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${paymentMode === "ONLINE" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMode === "ONLINE" ? "border-blue-600" : "border-gray-300"}`}>
                  {paymentMode === "ONLINE" && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                </div>
                <div>
                  <p className="font-bold text-sm">Pay Advance</p>
                  <p className="text-xs text-gray-500">Secure your booking now.</p>
                </div>
              </div>

              {paymentMode === "ONLINE" && (
                <div className="ml-8 grid grid-cols-3 gap-2">
                  {[25, 50, 100].map((pct) => (
                    <AsyncButton key={pct} onClick={() => setAdvancePercent(pct)} className={`py-2 text-xs font-bold rounded border ${advancePercent === pct ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600"}`}>
                      {pct}% (₹{Math.round((finalPrice * pct) / 100)})
                    </AsyncButton>
                  ))}
                </div>
              )}

              {paymentMode === "ONLINE" && (
                <div className="text-center mt-4 bg-gray-50 p-4 rounded-xl border">
                  <p className="mb-2 text-gray-700 text-sm">Scan to pay <strong className="text-lg text-black">₹{payNowAmount}</strong></p>
                  <img src={`${qrApiBase}${encodeURIComponent(qrData)}`} alt="QR" className="mx-auto border p-2 rounded-lg bg-white" width={160} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex gap-3 sticky bottom-0 z-10 bg-white">
          {step === 2 ? (
             <AsyncButton onClick={() => setStep(1)} className="flex-1 py-3 text-gray-600 bg-gray-200 rounded-xl font-bold hover:bg-gray-300 transition-colors">Back</AsyncButton>
          ) : (
             <AsyncButton onClick={onClose} className="flex-1 py-3 text-gray-600 bg-gray-200 rounded-xl font-bold hover:bg-gray-300 transition-colors">Cancel</AsyncButton>
          )}

          {step === 1 ? (
             <AsyncButton 
               onClick={() => setStep(2)} 
               disabled={(locationType === 'CLINIC' && !selectedClinicId) || (locationType === 'HOME' && !homeAddress)}
               className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200 transition-all"
             >
               Proceed to Payment
             </AsyncButton>
          ) : (
            <AsyncButton 
              onClick={handleConfirmBooking} 
              disabled={isProcessing}
              className="flex-[2] bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 disabled:opacity-70 transition-all"
            >
              {isProcessing ? "Processing..." : `Confirm (₹${finalPrice})`}
            </AsyncButton>
          )}
        </div>
      </div>
    </div>
  );
}