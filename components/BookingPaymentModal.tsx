"use client";

import { useSession, signIn } from "next-auth/react";
import { useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function BookingPaymentModal({ 
  isOpen, onClose, specialist, date, slot, duration, locationType, address, totalPrice 
}: any) {
  const { data: session } = useSession();
  const router = useRouter();
  
  // Steps: 1 = Details, 2 = Payment
  const [step, setStep] = useState(1); 
  
  // New State for Step 1
  const [medicalCondition, setMedicalCondition] = useState("");
  const [medicalDocs, setMedicalDocs] = useState(""); // Stores mock URL
  const [selectedClinicId, setSelectedClinicId] = useState("");

  // Payment State
  const [paymentMode, setPaymentMode] = useState<"SERVICE" | "ONLINE">("SERVICE");
  const [advancePercent, setAdvancePercent] = useState(100);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  // --- 1. LOGIN CHECK ---
  if (!session) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">🔒</div>
          <h3 className="text-xl font-bold mb-2">Login Required</h3>
          <p className="text-gray-500 mb-6">Please login to confirm your booking.</p>
          <button onClick={() => signIn()} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700">Login</button>
          <button onClick={onClose} className="mt-4 text-sm text-gray-500 hover:text-gray-900">Cancel</button>
        </div>
      </div>
    );
  }

  // --- 2. ROLE CHECK (Prevent Doctors/Admins from booking) ---
  const userRole = (session.user as any)?.role;
  if (userRole === "SPECIALIST" || userRole === "ADMIN") {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-fade-in">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">⛔</div>
          <h3 className="text-xl font-bold mb-2">Action Not Allowed</h3>
          <p className="text-gray-500 mb-6">
            You are logged in as a <strong>{userRole === 'SPECIALIST' ? 'Doctor' : 'Admin'}</strong>.
            <br />
            To book an appointment, please log in with a <strong>Patient</strong> account.
          </p>
          <button onClick={onClose} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-black">Okay, Close</button>
        </div>
      </div>
    );
  }

  const payNowAmount = paymentMode === "SERVICE" ? 0 : (totalPrice * advancePercent) / 100;
  
  // Dummy QR Logic
  const qrApiBase = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=";
  const qrData = `upi://pay?pa=healthplatform@upi&pn=Health&am=${payNowAmount}&cu=INR`;

  // Dummy File Upload
  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      const promise = fetch("/api/upload", { method: "POST", body: formData })
        .then(res => res.json())
        .then(data => {
           if(data.success) {
             setMedicalDocs(data.url); // Saves /api/files/xyz.enc
             return "File uploaded!";
           } else {
             throw new Error("Upload failed");
           }
        });

      toast.promise(promise, {
        loading: 'Encrypting & Uploading...',
        success: 'Securely Uploaded!',
        error: 'Upload failed',
      });
    }
  };

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          userId: session.user.id,
          specialistId: specialist.id,
          date: date,
          slotTime: slot,
          totalPrice: totalPrice,
          amountPaid: payNowAmount,
          paymentType: paymentMode === "SERVICE" ? "PAY_ON_SERVICE" : "ONLINE_ADVANCE",
          duration: duration,
          locationType: locationType,
          visitAddress: address,
          clinicId: selectedClinicId || null,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">
            {step === 1 ? "Patient Details" : "Review & Pay"}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {/* Summary Card */}
          <div className="bg-blue-50 p-4 rounded-xl mb-6 space-y-2">
            <div className="flex justify-between font-bold text-gray-900">
              <span>{specialist.name}</span>
              <span>₹{totalPrice}</span>
            </div>
            <p className="text-sm text-gray-600">
              {locationType === "HOME" ? "🏠 Home Visit" : "🏥 Clinic Visit"} • {duration} Days
            </p>
            <p className="text-sm text-gray-600">
              Starts: <span className="font-semibold">{format(date, "d MMM, h:mm a")}</span>
            </p>
          </div>

          {/* STEP 1: MEDICAL INFO & CLINIC */}
          {step === 1 && (
            <div className="space-y-4">
               {locationType === "CLINIC" && (
                 <div>
                   <label className="block text-sm font-bold mb-1 text-gray-700">Select Clinic</label>
                   <select 
                     className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500 bg-white"
                     onChange={(e) => setSelectedClinicId(e.target.value)}
                     value={selectedClinicId}
                   >
                     <option value="">-- Choose a Clinic --</option>
                     {specialist.clinics?.map((c: any) => (
                       <option key={c.id} value={c.id}>{c.name} ({c.city})</option>
                     ))}
                   </select>
                   {specialist.clinics?.length === 0 && <p className="text-xs text-red-500 mt-1">Doctor has no clinics listed.</p>}
                 </div>
               )}

               <div>
                 <label className="block text-sm font-bold mb-1 text-gray-700">Medical Condition / Symptoms</label>
                 <textarea 
                   className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:border-blue-500" 
                   rows={3}
                   placeholder="Briefly describe your issue..."
                   value={medicalCondition}
                   onChange={(e) => setMedicalCondition(e.target.value)}
                 />
               </div>

               <div>
                 <label className="block text-sm font-bold mb-1 text-gray-700">Upload Reports (Optional)</label>
                 <div className="border border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition cursor-pointer relative">
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                    <p className="text-sm text-blue-600 font-bold">Click to Upload</p>
                    <p className="text-xs text-gray-400 mt-1">{medicalDocs ? "File Selected" : "PDF or Images"}</p>
                 </div>
               </div>
            </div>
          )}

          {/* STEP 2: PAYMENT */}
          {step === 2 && (
            <div className="space-y-4">
              <label className="block font-semibold mb-2">Payment Option</label>
              
              <div 
                onClick={() => setPaymentMode("SERVICE")}
                className={`p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${paymentMode === "SERVICE" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMode === "SERVICE" ? "border-blue-600" : "border-gray-400"}`}>
                  {paymentMode === "SERVICE" && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                </div>
                <div>
                  <p className="font-bold">Pay Later</p>
                  <p className="text-xs text-gray-500">Pay full amount after service.</p>
                </div>
              </div>

              <div 
                onClick={() => setPaymentMode("ONLINE")}
                className={`p-4 border-2 rounded-xl cursor-pointer flex items-center gap-3 transition-all ${paymentMode === "ONLINE" ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMode === "ONLINE" ? "border-blue-600" : "border-gray-400"}`}>
                  {paymentMode === "ONLINE" && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />}
                </div>
                <div>
                  <p className="font-bold">Pay Advance</p>
                  <p className="text-xs text-gray-500">Secure your booking online.</p>
                </div>
              </div>

              {paymentMode === "ONLINE" && (
                <div className="ml-8 grid grid-cols-3 gap-2">
                  {[25, 50, 100].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setAdvancePercent(pct)}
                      className={`py-2 text-xs font-bold rounded border transition-colors ${advancePercent === pct ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                    >
                      {pct}% (₹{(totalPrice * pct) / 100})
                    </button>
                  ))}
                </div>
              )}

              {paymentMode === "ONLINE" && (
                <div className="text-center mt-4">
                  <p className="mb-4 text-gray-700">Scan to pay <strong className="text-xl">₹{payNowAmount}</strong></p>
                  <img src={`${qrApiBase}${encodeURIComponent(qrData)}`} alt="QR" className="mx-auto border p-2 rounded-xl" width={180} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-gray-50 flex gap-3">
          {step === 2 ? (
             <button onClick={() => setStep(1)} className="flex-1 py-3 text-gray-600 bg-gray-200 rounded-xl font-bold hover:bg-gray-300">Back</button>
          ) : (
             <button onClick={onClose} className="flex-1 py-3 text-gray-600 bg-gray-200 rounded-xl font-bold hover:bg-gray-300">Cancel</button>
          )}

          {step === 1 ? (
             <button 
               onClick={() => setStep(2)} 
               disabled={locationType === 'CLINIC' && !selectedClinicId}
               className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
             >
               Proceed to Payment
             </button>
          ) : (
            <button 
              onClick={handleConfirmBooking} 
              disabled={isProcessing}
              className="flex-[2] bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 disabled:opacity-70"
            >
              {isProcessing ? "Processing..." : "Confirm Booking"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}