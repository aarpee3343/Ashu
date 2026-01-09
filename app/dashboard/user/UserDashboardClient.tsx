"use client";

import { useState } from "react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function UserDashboardClient({ user }: any) {
  const router = useRouter();

  /* =========================
      TAB STATE
   ========================== */
  const [activeTab, setActiveTab] = useState<
    "APPOINTMENTS" | "PAYMENTS" | "PROFILE"
  >("APPOINTMENTS");

  /* =========================
      PAYMENT MODAL STATE
   ========================== */
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  /* =========================
      PROFILE STATE
   ========================== */
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    phone: user.phone || "",
    address: user.address || "",
    gender: user.gender || "Not Specified",
  });

  /* =========================
      VITALS STATE (NEW)
   ========================== */
  const [vitals, setVitals] = useState(user.vitals || []);
  const [isAddingVital, setIsAddingVital] = useState(false);
  const [newVital, setNewVital] = useState({ type: "", value: "" });

  /* =========================
      ACTIONS
   ========================== */
  
  // 1. PROFILE UPDATE
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated successfully!");
    setIsEditing(false);
  };

  // 2. CANCEL BOOKING
  const handleCancel = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "CANCEL" }),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Appointment cancelled");
      router.refresh();
    } catch {
      toast.error("Could not cancel");
    }
  };

  // 3. RESCHEDULE
  const handleReschedule = async (booking: any) => {
    if (!confirm("To reschedule, we need to cancel this appointment and book a new one. Proceed?")) return;

    await handleCancel(booking.id);
    router.push(`/specialists/${booking.specialistId}`);
  };

  // 4. PAYMENTS
  const openPayModal = (booking: any) => {
    setSelectedBooking(booking);
    setPayModalOpen(true);
  };

  const processBalancePayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "PAY_BALANCE" }),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Payment Successful!");
      setPayModalOpen(false);
      router.refresh();
    } catch {
      toast.error("Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. VITALS ACTIONS (NEW)
  const handleAddVital = async () => {
    if (!newVital.type || !newVital.value) return;

    const res = await fetch("/api/user/vitals", {
      method: "POST",
      body: JSON.stringify(newVital),
    });

    const savedVital = await res.json();
    setVitals([...vitals, savedVital]);
    setNewVital({ type: "", value: "" });
    setIsAddingVital(false);
  };

  const handleDeleteVital = async (id: number) => {
    await fetch(`/api/user/vitals?id=${id}`, { method: "DELETE" });
    setVitals(vitals.filter((v: any) => v.id !== id));
  };

  // 6. PDF INVOICE
  const downloadInvoice = (booking: any) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("INVOICE", 14, 22);

    doc.setFontSize(10);
    doc.text(`Invoice #: INV-${booking.id}`, 14, 30);
    doc.text(`Date: ${format(new Date(), "yyyy-MM-dd")}`, 14, 35);

    doc.text("HealthPlatform Inc.", 150, 22);
    doc.text("healthplatform.com", 150, 27);
    doc.text("support@healthplatform.com", 150, 32);

    doc.text("Bill To:", 14, 50);
    doc.setFontSize(12);
    doc.text(user.name, 14, 56);
    doc.setFontSize(10);
    doc.text(user.email, 14, 61);

    autoTable(doc, {
      startY: 70,
      head: [["Description", "Doctor", "Date", "Amount"]],
      body: [
        [
          "Medical Consultation",
          `Dr. ${booking.specialist.name}`,
          format(new Date(booking.date), "dd MMM yyyy"),
          `INR ${booking.totalPrice}`,
        ],
      ],
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Total Amount: INR ${booking.totalPrice}`, 140, finalY);
    doc.text(`Paid Amount: INR ${booking.amountPaid}`, 140, finalY + 5);
    doc.text(
      `Balance Due: INR ${booking.totalPrice - booking.amountPaid}`,
      140,
      finalY + 12
    );

    doc.save(`Invoice_${booking.id}.pdf`);
  };

  /* =========================
      RENDER
   ========================== */
  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* HEADER */}
      <div className="bg-white border-b pt-24 pb-8 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, {user.name}</p>
          </div>
          <div className="flex bg-gray-100 p-1 rounded-lg">
            {["APPOINTMENTS", "PAYMENTS", "PROFILE"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
                  activeTab === tab
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 mt-8">

        {/* ================= APPOINTMENTS TAB (RESTORED) ================= */}
        {activeTab === "APPOINTMENTS" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-800">Upcoming Appointments</h2>
            {user.bookings.filter((b: any) => b.status === 'UPCOMING').length === 0 ? (
               <div className="bg-white p-8 rounded-xl text-center border border-gray-200">
                 <p className="text-gray-500">No upcoming appointments.</p>
                 <a href="/specialists" className="text-blue-600 font-bold hover:underline mt-2 inline-block">Book Now</a>
               </div>
            ) : (
               user.bookings.filter((b: any) => b.status === 'UPCOMING').map((booking: any) => (
                 <div key={booking.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex gap-4 items-center">
                      <div className="bg-blue-50 text-blue-600 font-bold p-3 rounded-lg text-center min-w-[60px]">
                        <span className="block text-xl">{format(new Date(booking.date), 'd')}</span>
                        <span className="text-xs uppercase">{format(new Date(booking.date), 'MMM')}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{booking.specialist.name}</h3>
                        <p className="text-sm text-gray-500">
                          {booking.specialist.category} • {booking.slotTime}
                          {booking.locationType === 'HOME' && <span className="ml-2 bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">HOME VISIT</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                       <button onClick={() => handleCancel(booking.id)} className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 font-semibold rounded-lg hover:bg-red-50 text-sm">Cancel</button>
                       <button onClick={() => handleReschedule(booking)} className="flex-1 md:flex-none px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-sm">Reschedule</button>
                    </div>
                 </div>
               ))
            )}
            
            <h2 className="text-xl font-bold text-gray-800 mt-10">History & Cancelled</h2>
            <div className="opacity-70 space-y-4">
              {user.bookings.filter((b: any) => b.status !== 'UPCOMING').map((booking: any) => (
                 <div key={booking.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
                   <div>
                     <p className="font-bold text-gray-700">{booking.specialist.name}</p>
                     <p className="text-xs text-gray-500">{format(new Date(booking.date), 'dd MMM yyyy')} • {booking.status}</p>
                   </div>
                   {booking.status === 'COMPLETED' && (
                     <button onClick={() => downloadInvoice(booking)} className="text-xs text-blue-600 underline">Download Invoice</button>
                   )}
                 </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= PAYMENTS TAB (RESTORED) ================= */}
        {activeTab === "PAYMENTS" && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Doctor</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {user.bookings.map((b: any) => {
                  const balance = b.totalPrice - b.amountPaid;
                  return (
                    <tr key={b.id}>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{b.specialist.name}</div>
                        <div className="text-xs text-gray-500">{format(new Date(b.date), 'dd MMM')}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">Paid: ₹{b.amountPaid} / <span className="text-gray-400">₹{b.totalPrice}</span></div>
                        {balance > 0 ? <span className="text-xs font-bold text-red-600">Due: ₹{balance}</span> : <span className="text-xs font-bold text-green-600">Fully Paid</span>}
                      </td>
                      <td className="p-4 text-right">
                        {balance > 0 && b.status !== 'CANCELLED' ? (
                          <button onClick={() => openPayModal(b)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-green-700">Pay Balance</button>
                        ) : (
                          <button onClick={() => downloadInvoice(b)} className="border border-gray-300 text-gray-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-gray-50">Invoice</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= PROFILE TAB ================= */}
        {activeTab === "PROFILE" && (
          <div className="bg-white p-8 rounded-xl border border-gray-200 max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Personal Information</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-blue-600 font-semibold hover:underline"
              >
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="p-2 border rounded-lg bg-gray-50"
                />
                <select
                  disabled={!isEditing}
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="p-2 border rounded-lg bg-gray-50"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <input
                disabled={!isEditing}
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full p-2 border rounded-lg bg-gray-50"
              />

              <textarea
                disabled={!isEditing}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full p-2 border rounded-lg bg-gray-50"
                rows={3}
              />

              {isEditing && (
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold">
                  Save Changes
                </button>
              )}
            </form>

            {/* ================= VITALS (UPDATED) ================= */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">My Vitals</h3>
                <button
                  onClick={() => setIsAddingVital(true)}
                  className="text-sm text-blue-600 font-bold"
                >
                  + Add Custom Vital
                </button>
              </div>

              {isAddingVital && (
                <div className="bg-blue-50 p-4 rounded-lg mb-4 flex gap-2">
                  <input
                    placeholder="Type (e.g. Height)"
                    className="flex-1 p-2 rounded border"
                    value={newVital.type}
                    onChange={(e) =>
                      setNewVital({ ...newVital, type: e.target.value })
                    }
                  />
                  <input
                    placeholder="Value (e.g. 6ft)"
                    className="flex-1 p-2 rounded border"
                    value={newVital.value}
                    onChange={(e) =>
                      setNewVital({ ...newVital, value: e.target.value })
                    }
                  />
                  <button
                    onClick={handleAddVital}
                    className="bg-blue-600 text-white px-4 rounded font-bold"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsAddingVital(false)}
                    className="text-gray-500 px-2"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {vitals.map((v: any) => (
                  <div
                    key={v.id}
                    className="bg-gray-50 p-4 rounded-lg flex justify-between items-center group"
                  >
                    <div>
                      <p className="text-xs text-gray-500 uppercase">
                        {v.type}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {v.value}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteVital(v.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= PAY MODAL ================= */}
      {payModalOpen && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 text-center">
            <h3 className="text-lg font-bold mb-2">Pay Remaining Balance</h3>

            <p className="text-3xl font-bold mb-6">
              ₹{selectedBooking.totalPrice - selectedBooking.amountPaid}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setPayModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 rounded-xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={processBalancePayment}
                disabled={isProcessing}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold"
              >
                {isProcessing ? "Verifying..." : "I Have Paid"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}