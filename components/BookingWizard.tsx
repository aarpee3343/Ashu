"use client";

import { useState, useEffect } from "react";
import { format, addDays, isSameDay } from "date-fns";
import {
  X,
  ChevronLeft,
  CheckCircle,
  Loader2,
  Building2,
  CreditCard,
  Banknote,
  UploadCloud
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  generateVideoSlots,
  generateHomeSlots,
  generateClinicSlots
} from "@/lib/slots";

export default function BookingWizard({
  isOpen,
  onClose,
  specialist,
  mode,
  user
}: any) {
  const router = useRouter();

  /* ---------------- STATE ---------------- */
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [patientId, setPatientId] = useState("SELF");
  const [address, setAddress] = useState("");
  const [homeDays, setHomeDays] = useState(1);
  const [loading, setLoading] = useState(false);
  const [busySlots, setBusySlots] = useState<string[]>([]);

  /* ---- Medical Info ---- */
  const [medicalCondition, setMedicalCondition] = useState("");
  const [uploadedDoc, setUploadedDoc] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  /* ---- Payment ---- */
  const [paymentMethod, setPaymentMethod] = useState<"ONLINE" | "CASH">("ONLINE");
  const [transactionId, setTransactionId] = useState("");

  /* ---------------- INIT ---------------- */
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setTransactionId("");
      setPaymentMethod("ONLINE");
      setMedicalCondition("");
      setUploadedDoc("");
      if (mode === "CLINIC" && specialist.clinics?.length === 1) {
        setSelectedClinicId(specialist.clinics[0].id);
      }
    }
  }, [isOpen, mode, specialist]);

  /* -------- FETCH BUSY SLOTS -------- */
  useEffect(() => {
    const fetchAvailability = async () => {
      setBusySlots([]);
      try {
        const dateStr = format(selectedDate, "yyyy-MM-dd");
        const res = await fetch(
          `/api/slots/availability?specialistId=${specialist.id}&date=${dateStr}`
        );
        const data = await res.json();
        if (data.bookedSlots) setBusySlots(data.bookedSlots);
      } catch {
        console.error("Availability fetch failed");
      }
    };
    fetchAvailability();
  }, [selectedDate, specialist.id]);

  /* ---------------- DATA ---------------- */
  const allSlots =
    mode === "VIDEO"
      ? generateVideoSlots(selectedDate)
      : mode === "HOME"
      ? generateHomeSlots(selectedDate)
      : generateClinicSlots();

  const dateStrip = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));
  const basePrice =
    mode === "VIDEO"
      ? specialist.videoConsultationFee || specialist.price
      : specialist.price;
  const totalPrice = basePrice * (mode === "HOME" ? homeDays : 1);

  /* -------- FILE UPLOAD -------- */
  const handleFileUpload = async (e: any) => {
  const file = e.target.files[0];
  if (!file) return;

  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  const maxSize = 2 * 1024 * 1024; // 2 MB

  if (!allowedTypes.includes(file.type)) {
    toast.error("Only PDF or image files are allowed");
    return;
  }

  if (file.size > maxSize) {
    toast.error("File size must be less than 2 MB");
    return;
  }

  setIsUploading(true);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(`/api/upload?filename=${file.name}`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.url) {
      setUploadedDoc(data.url);
      toast.success("File uploaded securely");
    } else {
      throw new Error();
    }
  } catch {
    toast.error("Upload failed");
  } finally {
    setIsUploading(false);
  }
};


  /* -------- STEP VALIDATION -------- */
  const handleNext = () => {
    if (step === 1) {
      if (mode === "CLINIC" && !selectedClinicId)
        return toast.error("Please select a clinic");
      if (!selectedSlot) return toast.error("Please select a time slot");
    }

    if (step === 2) {
      if (!medicalCondition || medicalCondition.length < 3)
        return toast.error("Medical condition is required");
      if (mode === "HOME" && !address)
        return toast.error("Home address is required");
    }

    setStep(step + 1);
  };

  /* -------- BOOK -------- */
  const handleBook = async () => {
    if (paymentMethod === "ONLINE" && transactionId.length < 5)
      return toast.error("Enter valid UTR");

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
        clinicId: mode === "CLINIC" ? Number(selectedClinicId) : null,
        familyMemberId: patientId === "SELF" ? null : Number(patientId),
        paymentType:
          paymentMethod === "ONLINE" ? "UPI_ONLINE" : "PAY_ON_SERVICE",
        amountPaid: paymentMethod === "ONLINE" ? totalPrice : 0,
        transactionId: paymentMethod === "ONLINE" ? transactionId : null,
        medicalCondition,
        medicalDocs: uploadedDoc
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Booking failed");

      toast.success(
        paymentMethod === "ONLINE"
          ? "Payment sent for verification!"
          : "Booking Confirmed!"
      );

      router.push("/dashboard/user");
      router.refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-[30px] h-[85vh] flex flex-col">
        {/* HEADER */}
        <div className="p-5 border-b flex items-center justify-between">
          {step > 1 ? (
            <button onClick={() => setStep(step - 1)}>
              <ChevronLeft />
            </button>
          ) : (
            <div className="w-6" />
          )}
          <h3 className="font-bold text-lg">
            {step === 1 && "Slot & Time"}
            {step === 2 && "Patient Details"}
            {step === 3 && "Payment"}
          </h3>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* STEP 1 */}
          {step === 1 && (
            <>
              {mode === "CLINIC" &&
                specialist.clinics?.map((c: any) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedClinicId(c.id)}
                    className={`w-full p-4 rounded-xl border flex gap-3 ${
                      selectedClinicId === c.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <Building2 />
                    <div>
                      <p className="font-bold">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.city}</p>
                    </div>
                  </button>
                ))}

              {/* Date */}
              <div className="flex gap-3 overflow-x-auto">
                {dateStrip.map((d) => (
                  <button
                    key={d.toString()}
                    onClick={() => {
                      setSelectedDate(d);
                      setSelectedSlot("");
                    }}
                    className={`w-16 h-20 rounded-xl ${
                      isSameDay(d, selectedDate)
                        ? "bg-black text-white"
                        : "border"
                    }`}
                  >
                    <div className="text-xs">{format(d, "EEE")}</div>
                    <div className="text-lg">{format(d, "d")}</div>
                  </button>
                ))}
              </div>

              {/* Slots */}
              <div className="grid grid-cols-3 gap-3">
                {allSlots.map((slot) => {
                  const isBusy = busySlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      disabled={isBusy}
                      onClick={() => !isBusy && setSelectedSlot(slot)}
                      className={`py-3 rounded-xl text-xs font-bold ${
                        isBusy
                          ? "bg-gray-100 text-gray-400"
                          : selectedSlot === slot
                          ? "bg-blue-600 text-white"
                          : "border"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <textarea
                value={medicalCondition}
                onChange={(e) => setMedicalCondition(e.target.value)}
                placeholder="Medical condition / reason"
                className="w-full p-3 border rounded-xl"
              />

              <div className="border-2 border-dashed rounded-xl p-4 text-center">
                <UploadCloud className="mx-auto mb-2" />
                <input type="file" onChange={handleFileUpload} />
                {isUploading && <p className="text-xs">Uploading...</p>}
                {uploadedDoc && (
                  <p className="text-xs text-green-600">
                    File attached securely
                  </p>
                )}
              </div>

              {mode === "HOME" && (
                <>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Home address"
                    className="w-full p-3 border rounded-xl"
                  />
                  <input
                    type="range"
                    min={1}
                    max={7}
                    value={homeDays}
                    onChange={(e) => setHomeDays(Number(e.target.value))}
                  />
                </>
              )}
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <h1 className="text-3xl font-bold text-center">₹{totalPrice}</h1>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod("ONLINE")}
                  className={`p-4 border rounded-xl ${
                    paymentMethod === "ONLINE" && "border-blue-600"
                  }`}
                >
                  <CreditCard /> Pay Now
                </button>
                <button
                  disabled={mode === "VIDEO"}
                  onClick={() => setPaymentMethod("CASH")}
                  className={`p-4 border rounded-xl ${
                    paymentMethod === "CASH" && "border-green-600"
                  }`}
                >
                  <Banknote /> Pay Later
                </button>
              </div>

              {paymentMethod === "ONLINE" && (
                <input
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter UTR"
                  className="w-full p-3 border rounded-xl text-center"
                />
              )}
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-5 border-t">
          <button
            onClick={step < 3 ? handleNext : handleBook}
            disabled={loading}
            className="w-full py-4 bg-black text-white rounded-xl"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" /> : step < 3 ? "Continue" : "Confirm Booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
