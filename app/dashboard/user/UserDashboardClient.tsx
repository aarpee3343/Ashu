"use client";

import { useState, useEffect } from "react";
import { 
  User, Calendar, CreditCard, FileText, Clock, Eye, Download, Activity, X, 
  ChevronRight, CheckCircle, Loader2, AlertTriangle, Star, MessageSquare, 
  MapPin, Phone, Users, AtSign, Plus, Save, Edit2, AlertCircle
} from 'lucide-react';
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import AsyncButton from "@/components/ui/AsyncButton";
import { generatePrescriptionPDF } from "@/lib/pdfGenerator";

// Invoice Helper (Dynamic Import)
const generateInvoice = async (data: any) => {
  try {
    const { generateInvoice } = await import('@/components/InvoiceGenerator');
    await generateInvoice(data);
  } catch (error) {
    console.error(error);
    toast.error('Failed to generate invoice');
  }
};

export default function UserDashboardClient({ user }: any) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("APPOINTMENTS");
  
  // Modals
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [payModalData, setPayModalData] = useState<any>(null);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [editingReview, setEditingReview] = useState<any>(null); // For editing existing reviews
  const [writeReviewData, setWriteReviewData] = useState<any>(null); // ✅ NEW: Review Modal State

  // Review Form Data
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  const [loading, setLoading] = useState(false);
  const [familyMembers, setFamilyMembers] = useState(user.familyMembers || []);
  const [vitals, setVitals] = useState(user.vitals?.[0] || {}); 
  
  // Simple Profile Form (Existing)
  const [profileData, setProfileData] = useState({ 
    phone: user.phone || "", age: user.age || "", gender: user.gender || "Male", address: user.address || "" 
  });
  const [newMember, setNewMember] = useState({ name: "", relation: "", age: "", gender: "Male" });
  const [vitalForm, setVitalForm] = useState({
    weight: vitals.value?.split('|')[0] || "",
    height: vitals.value?.split('|')[1] || "",
    bp: vitals.value?.split('|')[2] || "",
    sugar: vitals.value?.split('|')[3] || "",
    bloodGroup: vitals.type || ""
  });
  const [utrInput, setUtrInput] = useState("");

  // --- SYNC EFFECTS ---
  useEffect(() => {
    if (user.familyMembers) {
      setFamilyMembers(user.familyMembers);
    }
  }, [user.familyMembers]);

  useEffect(() => {
    const interval = setInterval(() => {
       router.refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  // Helpers
  const formatDoctorName = (name: string) => `Dr. ${name?.replace(/^(Dr\.?\s*)/i, '') || ''}`;

  // --- ACTIONS ---

  // ✅ NEW: Submit Review Handler
  const handleSubmitReview = async () => {
    if (!reviewForm.comment) return toast.error("Please write a comment");
    setLoading(true);
    
    const res = await fetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
            userId: user.id,
            specialistId: writeReviewData.specialistId,
            bookingId: writeReviewData.id,
            rating: reviewForm.rating,
            comment: reviewForm.comment
        })
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
        toast.success("Review Submitted!");
        setWriteReviewData(null); // Close modal
        setReviewForm({ rating: 5, comment: "" }); // Reset form
        router.refresh();
    } else {
        toast.error(data.error || "Failed to submit");
    }
  };

  // ✅ NEW: Update Review Handler
  const handleUpdateReview = async () => {
    if(!editingReview) return;
    setLoading(true);
    await fetch("/api/reviews", {
        method: "PATCH",
        body: JSON.stringify({
            reviewId: editingReview.id,
            rating: editingReview.rating,
            comment: editingReview.comment
        })
    });
    toast.success("Review Updated");
    setEditingReview(null);
    router.refresh();
    setLoading(false);
  };

  // Existing handlers
  const handleUpdateProfile = async () => {
    setLoading(true);
    await fetch("/api/user/profile", { method: "PATCH", body: JSON.stringify(profileData) });
    toast.success("Profile Updated");
    router.refresh();
    setLoading(false);
  };

  const handleAddFamily = async () => {
    if(!newMember.name) return toast.error("Name is required");
    setLoading(true);
    
    try {
        const res = await fetch("/api/user/family", { 
            method: "POST", 
            body: JSON.stringify(newMember) 
        });
        
        if(res.ok) {
            const addedMember = await res.json();
            setFamilyMembers([...familyMembers, addedMember]); 
            toast.success("Member Added"); 
            setShowFamilyModal(false);
            setNewMember({ name: "", relation: "", age: "", gender: "Male" });
            router.refresh(); 
        } else {
            toast.error("Failed to add member");
        }
    } catch (e) {
        toast.error("Something went wrong");
    } finally {
        setLoading(false);
    }
  };

  const handleSaveVitals = async () => {
    setLoading(true);
    const valueString = `${vitalForm.weight}|${vitalForm.height}|${vitalForm.bp}|${vitalForm.sugar}`;
    
    await fetch("/api/user/vitals", { 
        method: "POST", 
        body: JSON.stringify({ type: vitalForm.bloodGroup || "General", value: valueString }) 
    });
    toast.success("Vitals Logged");
    router.refresh();
    setLoading(false);
  };

  const handlePayBalance = async () => {
    if(utrInput.length < 5) return toast.error("Invalid UTR");
    setLoading(true);
    
    await fetch(`/api/bookings/${payModalData.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "PAY_BALANCE", transactionId: utrInput })
    });

    toast.success("Payment Recorded");
    setPayModalData(null);
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      
      {/* HEADER */}
      <div className="bg-white px-6 pt-12 pb-6 rounded-b-[30px] shadow-sm sticky top-0 z-20">
        <h1 className="text-2xl font-bold text-gray-900">Hello, {user.name}</h1>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Dashboard</p>
      </div>

      {/* TABS */}
      <div className="px-4 mt-6">
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm overflow-x-auto no-scrollbar gap-1">
          {[
            { id: "APPOINTMENTS", icon: Calendar, label: "Bookings" },
            { id: "FINANCE", icon: CreditCard, label: "Payments" },
            { id: "RECORDS", icon: FileText, label: "Records" },
            { id: "REVIEWS", icon: MessageSquare, label: "My Reviews" },
            { id: "PROFILE", icon: User, label: "Profile" },
          ].map((tab) => (
            <AsyncButton key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 min-w-[80px] rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? "bg-black text-white" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <tab.icon size={18} />
              <span className="text-[9px] font-bold uppercase">{tab.label}</span>
            </AsyncButton>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-4 mt-6 space-y-4">
        
        {/* --- 1. BOOKINGS TAB --- */}
        {activeTab === "APPOINTMENTS" && (
          <div className="space-y-4">
            {user.bookings.length === 0 && <p className="text-center text-gray-400 mt-10">No appointments yet.</p>}
            {user.bookings.map((b: any) => {
              const isOngoing = b.dailyLogs?.some((l: any) => l.status === 'COMPLETED') && b.status !== 'COMPLETED';
              const displayStatus = isOngoing ? 'ONGOING' : b.status;
              
              // ✅ Check Eligibility for Review
              const canReview = b.status === 'COMPLETED' && b.amountPaid >= b.totalPrice && !b.review;

              return (
              <div key={b.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative">
                <div className={`absolute top-3 right-3 px-2 py-0.5 text-[10px] font-bold rounded ${
                  displayStatus === 'UPCOMING' ? 'bg-blue-100 text-blue-700' : 
                  displayStatus === 'ONGOING' ? 'bg-orange-100 text-orange-700' :
                  displayStatus === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                  'bg-gray-100 text-gray-700'
                }`}>{displayStatus}</div>
                
                <div className="flex gap-4">
                  <div className="bg-gray-100 w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold text-gray-600">
                    <span className="text-lg">{format(new Date(b.date), "d")}</span>
                    <span className="text-[9px] uppercase">{format(new Date(b.date), "MMM")}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{formatDoctorName(b.specialist.name)}</h3>
                    <p className="text-xs text-gray-500">{b.specialist.category} • {b.slotTime}</p>
                    <AsyncButton onClick={() => setSelectedBooking(b)} className="mt-2 text-xs font-bold text-blue-600 flex items-center gap-1">
                      <Eye size={12} /> View Details
                    </AsyncButton>
                  </div>
                </div>

                {/* ✅ Action Buttons (Including Write Review) */}
                <div className="mt-4 flex gap-2">
                   {b.locationType === 'VIDEO' && b.status === 'UPCOMING' && (
                      <a href={`/room/${b.id}`} className="flex-1 bg-purple-600 text-white text-center py-2 rounded-lg text-sm font-bold shadow-lg shadow-purple-100">Join Call</a>
                   )}
                   
                   {/* SHOW REVIEW BUTTON ONLY IF ELIGIBLE */}
                   {canReview && (
                      <AsyncButton 
                        onClick={() => setWriteReviewData(b)}
                        className="flex-1 bg-yellow-400 text-black text-center py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                      >
                        <Star size={16} /> Write Review
                      </AsyncButton>
                   )}
                </div>
              </div>
            )})}
          </div>
        )}

        {/* --- 2. FINANCE TAB --- */}
        {activeTab === "FINANCE" && (
         <div className="space-y-3">
            {user.bookings.map((b: any) => {
               const due = b.totalPrice - b.amountPaid;
               const isCompletedAndPaid = b.status === 'COMPLETED' && b.amountPaid >= b.totalPrice;

               return (
                  <div key={b.id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                  <div>
                     <p className="font-bold text-sm flex items-center">
                        <User size={18} className="mr-2" /> {formatDoctorName(b.specialist.name)}
                     </p>
                     <p className="text-xs text-gray-400 flex items-center">
                        <Calendar size={16} className="mr-2" />
                        {format(new Date(b.date), "dd MMM")}
                     </p>
                  </div>
                  <div className="text-right">
                     <p className="font-bold text-gray-900">
                        ₹{b.totalPrice}
                     </p>

                     {b.amountPaid >= b.totalPrice ? (
                        <span className="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded font-bold flex items-center justify-center">
                        <CheckCircle size={12} className="mr-1" /> PAID
                        </span>
                     ) : (
                        <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded font-bold flex items-center">
                           <AlertTriangle size={12} className="mr-1" /> DUE: ₹{due}
                        </span>
                        <AsyncButton onClick={() => setPayModalData(b)} className="text-[10px] bg-black text-white px-2 py-1 rounded font-bold flex items-center">
                           <CreditCard size={12} className="mr-1" /> Pay Balance
                        </AsyncButton>
                        </div>
                     )}

                     {isCompletedAndPaid && (
                        <AsyncButton
                        onClick={() => generateInvoice({ booking: b, user: user })}
                        className="block mt-1 text-[10px] text-blue-600 underline flex items-center"
                        >
                        <Download size={12} className="mr-1" /> Download Invoice
                        </AsyncButton>
                     )}
                  </div>
                  </div>
               );
            })}
            </div>
        )}

        {/* --- 3. REVIEWS TAB (View Your Past Reviews) --- */}
        {activeTab === "REVIEWS" && (
           <div className="space-y-4">
              {user.reviews.length === 0 && <p className="text-center text-gray-400 mt-10">You haven't written any reviews yet.</p>}
              {user.reviews.map((r: any) => (
                 <div key={r.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                       <div>
                          <h3 className="font-bold text-gray-900">{formatDoctorName(r.specialist.name)}</h3>
                          <p className="text-xs text-gray-500">{format(new Date(r.createdAt), "dd MMM yyyy")}</p>
                       </div>
                       <div className="flex items-center gap-2">
                         <div className="flex gap-1 text-yellow-400">
                            <span className="font-bold text-black text-sm mr-1">{r.rating}</span>
                            <Star size={16} fill="currentColor" />
                         </div>
                         <AsyncButton onClick={() => setEditingReview(r)} className="text-blue-600 bg-blue-50 p-2 rounded-full">
                            <Edit2 size={14} />
                         </AsyncButton>
                       </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">"{r.comment}"</p>
                 </div>
              ))}
           </div>
        )}

        {/* --- 4. RECORDS TAB --- */}
        {activeTab === "RECORDS" && (
           <div className="space-y-3">
              {user.bookings.filter((b: any) => b.prescription || b.medicalDocs).length === 0 && <p className="text-center text-gray-400 mt-10">No records found</p>}
              
              {user.bookings.filter((b: any) => b.prescription).map((b: any) => (
                 <div key={b.id} className="bg-white p-4 rounded-xl border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><FileText size={20} /></div>
                       <div>
                         <p className="font-bold text-sm">Prescription</p>
                         <p className="text-xs text-gray-500">{formatDoctorName(b.specialist.name)} • {format(new Date(b.date), "d MMM")}</p>
                       </div>
                    </div>
                    <AsyncButton onClick={() => generatePrescriptionPDF(b, b.prescription)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200"><Download size={16} /></AsyncButton>
                 </div>
              ))}
           </div>
        )}

        {/* --- 5. PROFILE TAB --- */}
        {activeTab === "PROFILE" && (
           <div className="space-y-6">
              
              {/* VITALS SECTION */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><Activity size={18} /> My Vitals</h3>
                    <AsyncButton onClick={handleSaveVitals} disabled={loading} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold">{loading ? "Saving..." : "Update"}</AsyncButton>
                 </div>
                 <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Weight (kg)</label>
                        <input value={vitalForm.weight} onChange={e => setVitalForm({...vitalForm, weight: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="e.g. 70" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Height (cm)</label>
                        <input value={vitalForm.height} onChange={e => setVitalForm({...vitalForm, height: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="e.g. 175" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">BP (mmHg)</label>
                        <input value={vitalForm.bp} onChange={e => setVitalForm({...vitalForm, bp: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="e.g. 120/80" />
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Blood Group</label>
                        <select value={vitalForm.bloodGroup} onChange={e => setVitalForm({...vitalForm, bloodGroup: e.target.value})} className="w-full p-2 border rounded-lg bg-white">
                           <option value="">Select</option>
                           <option>A+</option><option>B+</option><option>O+</option><option>AB+</option>
                        </select>
                    </div>
                 </div>
              </div>

              {/* PERSONAL DETAILS */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100">
                 <h3 className="font-bold text-gray-900 mb-4">Personal Details</h3>
                 <div className="space-y-3">
                    <input placeholder="Phone" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full p-3 border rounded-xl" />
                    <div className="flex gap-3">
                       <input placeholder="Age" value={profileData.age} onChange={e => setProfileData({...profileData, age: e.target.value})} className="flex-1 p-3 border rounded-xl" />
                       <select value={profileData.gender} onChange={e => setProfileData({...profileData, gender: e.target.value})} className="flex-1 p-3 border rounded-xl bg-white">
                          <option>Male</option><option>Female</option>
                       </select>
                    </div>
                    <textarea placeholder="Address" value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} className="w-full p-3 border rounded-xl" />
                    <AsyncButton onClick={handleUpdateProfile} disabled={loading} className="w-full bg-black text-white font-bold py-3 rounded-xl">{loading ? "Saving..." : "Save Changes"}</AsyncButton>
                 </div>
              </div>

              {/* FAMILY SECTION */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100">
                 <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-gray-900">Family Members</h3>
                    <AsyncButton onClick={() => setShowFamilyModal(true)} className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold">+ Add</AsyncButton>
                 </div>
                 
                 {(!familyMembers || familyMembers.length === 0) ? (
                    <p className="text-xs text-gray-400 italic">No family members added.</p>
                 ) : (
                    <div className="space-y-2">
                        {familyMembers.map((m: any) => (
                        <div key={m.id} className="flex justify-between p-3 border rounded-lg bg-gray-50">
                            <div>
                                <span className="font-bold text-sm block">{m.name}</span>
                                <span className="text-xs text-gray-500">{m.relation} • {m.age} Yrs</span>
                            </div>
                            <span className="text-xs font-bold text-gray-400">{m.gender}</span>
                        </div>
                        ))}
                    </div>
                 )}
              </div>
           </div>
        )}
      </div>

      {/* --- MODAL: VIEW DETAILS --- */}
      {selectedBooking && (
         <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative">
               <AsyncButton onClick={() => setSelectedBooking(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200">
               <X size={16} />
               </AsyncButton>
               
               <h3 className="font-bold text-xl mb-1">Booking Details</h3>
               <p className="text-xs text-gray-500 mb-6">ID: #{selectedBooking.id}</p>
               
               <div className="space-y-4 text-sm">
               <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Doctor</span>
                  <span className="font-bold">{formatDoctorName(selectedBooking.specialist.name)}</span>
               </div>
               
               <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Patient</span>
                  <span className="font-bold">
                     {selectedBooking.familyMember ? selectedBooking.familyMember.name : "Myself"}
                  </span>
               </div>
               
               <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Date & Time</span>
                  <span className="font-bold">
                     {format(new Date(selectedBooking.date), "d MMM")} • {selectedBooking.slotTime}
                  </span>
               </div>
               
               <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">Fee Status</span>
                  <span className={
                     (selectedBooking.amountPaid >= selectedBooking.totalPrice || selectedBooking.status === 'COMPLETED') 
                     ? "text-green-600 font-bold" 
                     : "text-red-600 font-bold"
                  }>
                     {(selectedBooking.amountPaid >= selectedBooking.totalPrice || selectedBooking.status === 'COMPLETED') 
                     ? "Paid Full" 
                     : `Due ₹${selectedBooking.totalPrice - selectedBooking.amountPaid}`}
                  </span>
               </div>
               
               {selectedBooking.locationType === 'CLINIC' && selectedBooking.clinic && (
                  <div className="bg-gray-50 p-3 rounded-xl mt-2">
                     <p className="font-bold text-xs text-gray-500 uppercase mb-1">Clinic Address</p>
                     <p className="font-bold">{selectedBooking.clinic.name}</p>
                     <p className="text-xs text-gray-600">
                     {selectedBooking.clinic.address}, {selectedBooking.clinic.city}
                     </p>
                     <a 
                     href={`https://maps.google.com/?q=${selectedBooking.clinic.address}`} 
                     target="_blank" 
                     className="text-blue-600 text-xs font-bold mt-2 inline-flex items-center gap-1"
                     >
                     <MapPin size={12} /> View on Map
                     </a>
                  </div>
               )}
               
               {selectedBooking.locationType === 'HOME' && (
                  <div className="bg-gray-50 p-3 rounded-xl mt-2">
                     <p className="font-bold text-xs text-gray-500 uppercase mb-1">Home Visit Address</p>
                     <p className="text-sm">{selectedBooking.visitAddress}</p>
                  </div>
               )}
               </div>
            </div>
         </div>
         )}

      {/* --- MODAL: PAY BALANCE --- */}
      {payModalData && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative text-center">
              <AsyncButton onClick={() => setPayModalData(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={16} /></AsyncButton>
              
              <h3 className="font-bold text-lg mb-2">Pay Remaining Balance</h3>
              <h1 className="text-4xl font-bold text-gray-900 mb-6">₹{payModalData.totalPrice - payModalData.amountPaid}</h1>
              
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                 <p className="text-xs font-bold text-blue-600 uppercase mb-2">Scan QR</p>
                 <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=care@revivehub.co.in&pn=ReviveHub&am=${payModalData.totalPrice - payModalData.amountPaid}&cu=INR`} alt="QR" className="mx-auto w-32 h-32" />
              </div>

              <input 
                 value={utrInput}
                 onChange={(e) => setUtrInput(e.target.value)}
                 placeholder="Enter UTR / Ref No."
                 className="w-full p-3 border rounded-xl text-center font-mono tracking-widest mb-3"
              />
              
              <AsyncButton onClick={handlePayBalance} disabled={loading} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl">
                 {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify Payment"}
              </AsyncButton>
           </div>
        </div>
      )}
      
      {/* --- MODAL: ADD FAMILY --- */}
      {showFamilyModal && (
         <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white w-full max-w-sm rounded-2xl p-6">
               <h3 className="font-bold text-lg mb-4">Add Member</h3>
               <input placeholder="Name" className="w-full p-3 border rounded-xl mb-3" onChange={e => setNewMember({...newMember, name: e.target.value})} />
               <input placeholder="Relation (e.g. Wife)" className="w-full p-3 border rounded-xl mb-3" onChange={e => setNewMember({...newMember, relation: e.target.value})} />
               <div className="flex gap-2 mb-3">
                  <input placeholder="Age" className="flex-1 p-3 border rounded-xl" onChange={e => setNewMember({...newMember, age: e.target.value})} />
                  <select className="flex-1 p-3 border rounded-xl bg-white" onChange={e => setNewMember({...newMember, gender: e.target.value})}><option>Male</option><option>Female</option></select>
               </div>
               <AsyncButton onClick={handleAddFamily} disabled={loading} className="w-full bg-black text-white font-bold py-3 rounded-xl">{loading ? "Saving..." : "Add Member"}</AsyncButton>
               <AsyncButton onClick={() => setShowFamilyModal(false)} className="w-full text-center py-3 text-gray-500 mt-2">Cancel</AsyncButton>
            </div>
         </div>
      )}

      {/* --- MODAL: WRITE REVIEW --- */}
      {writeReviewData && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative">
              <AsyncButton onClick={() => setWriteReviewData(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={16} /></AsyncButton>
              
              <h3 className="font-bold text-xl mb-1">Rate Experience</h3>
              <p className="text-sm text-gray-500 mb-6">How was your appointment with <strong>{formatDoctorName(writeReviewData.specialist.name)}</strong>?</p>
              
              <div className="flex justify-center gap-2 mb-6">
                 {[1, 2, 3, 4, 5].map((star) => (
                    <AsyncButton key={star} onClick={() => setReviewForm({ ...reviewForm, rating: star })} className="transition-transform hover:scale-110">
                       <Star size={32} className={star <= reviewForm.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                    </AsyncButton>
                 ))}
              </div>
              
              <textarea 
                 value={reviewForm.comment} 
                 onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                 className="w-full p-3 border rounded-xl h-24 mb-4 focus:ring-2 focus:ring-yellow-400 outline-none"
                 placeholder="Share your feedback..."
              />
              
              <AsyncButton onClick={handleSubmitReview} disabled={loading} className="w-full bg-black text-white py-3 rounded-xl font-bold">
                 {loading ? "Submitting..." : "Submit Review"}
              </AsyncButton>
           </div>
        </div>
      )}

      {/* --- MODAL: EDIT REVIEW --- */}
      {editingReview && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative">
              <AsyncButton onClick={() => setEditingReview(null)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20} /></AsyncButton>
              <h3 className="font-bold text-xl mb-4">Edit Review</h3>
              
              <div className="flex gap-2 mb-4 justify-center">
                 {[1, 2, 3, 4, 5].map((star) => (
                    <AsyncButton key={star} onClick={() => setEditingReview({...editingReview, rating: star})}>
                       <Star size={32} className={star <= editingReview.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                    </AsyncButton>
                 ))}
              </div>
              
              <textarea 
                 value={editingReview.comment} 
                 onChange={(e) => setEditingReview({...editingReview, comment: e.target.value})}
                 className="w-full p-3 border rounded-xl h-32 mb-4"
                 placeholder="Write your experience..."
              />
              
              <AsyncButton onClick={handleUpdateReview} disabled={loading} className="w-full bg-black text-white py-3 rounded-xl font-bold">
                 {loading ? "Saving..." : "Update Review"}
              </AsyncButton>
           </div>
        </div>
      )}

    </div>
  );
}