"use client";

import { useState, useEffect } from "react";
import { format, addDays, startOfToday } from "date-fns";
import BookingPaymentModal from "./BookingPaymentModal";
import toast from "react-hot-toast";

// CONSTANT: Time Slots (Must match Doctor Dashboard)
const ALL_TIMES = [
  "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"
];

export default function BookingCalendar({ specialist }: any) {
  // Booking States
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  // New Features States
  const [duration, setDuration] = useState(1);
  const [locationType, setLocationType] = useState<"CLINIC" | "HOME">("CLINIC");
  const [address, setAddress] = useState("");
  
  // Data States
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Calculate Valid Date Range (Next 7 Days starting tomorrow)
  const today = startOfToday();
  const minDate = addDays(today, 1); 
  const dates = Array.from({ length: 7 }, (_, i) => addDays(minDate, i));

  // 2. Fetch availability for SPECIFIC selected date
  useEffect(() => {
    if (selectedDate) {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      // The API should handle overlaps (e.g. 7-day courses blocking today)
      fetch(`/api/slots/availability?specialistId=${specialist.id}&date=${dateStr}`)
        .then(res => res.json())
        .then(data => setBookedSlots(data.bookedSlots || []));
    }
  }, [selectedDate, specialist.id]);

  const handleBookClick = () => {
    if (!selectedDate || !selectedSlot) {
      toast.error("Please select a date and time");
      return;
    }
    if (locationType === "HOME" && address.trim().length < 10) {
      toast.error("Please enter a valid home address");
      return;
    }
    setIsModalOpen(true);
  };

  // Basic Count Estimator for the Date Strip
  // Note: For perfect accuracy, this would need a batch API call. 
  // Here we use the slots length vs booked length approximation for visual guidance.
  const getAvailableCount = (dateToCheck: Date) => {
    // This is a client-side approximation for the strip.
    // The grid below uses the authoritative API data.
    return "Check"; 
  };

  const totalPrice = specialist.price * duration;

  return (
    <>
      <div className="h-full flex flex-col space-y-6">
        
        {/* 1. DATE PICKER */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">1. Start Date</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {dates.map((date) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              return (
                <button
                  key={date.toString()}
                  onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                  className={`flex-shrink-0 w-24 p-2 rounded-xl border transition-all text-center ${
                    isSelected 
                      ? "bg-blue-600 text-white border-blue-600 shadow-md transform scale-105" 
                      : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="text-[10px] font-medium uppercase opacity-80">
                    {format(date, "EEE")}
                  </div>
                  <div className="text-lg font-bold">
                    {format(date, "d")}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. SLOT PICKER */}
        <div>
          <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">2. Start Time</h3>
          {!selectedDate ? (
            <p className="text-sm text-gray-400 italic">Select a date first.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {ALL_TIMES.map((slot) => {
                const isBooked = bookedSlots.includes(slot);
                const isSelected = selectedSlot === slot;
                return (
                  <button
                    key={slot}
                    disabled={isBooked}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-1 text-xs rounded-lg font-medium border transition-all ${
                      isBooked
                        ? "bg-gray-50 text-gray-300 cursor-not-allowed border-transparent decoration-slice line-through"
                        : isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. DURATION & TYPE */}
        <div className="bg-gray-50 p-4 rounded-xl space-y-4">
          
          {/* Duration Slider */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-bold text-gray-900">Duration</label>
              <span className="text-sm font-bold text-blue-600">{duration} Days</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="30" 
              value={duration} 
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-xs text-gray-500 mt-1">Course ends on {selectedDate ? format(addDays(selectedDate, duration - 1), "dd MMM") : "-"}</p>
          </div>

          <div className="border-t border-gray-200 my-2"></div>

          {/* Location Toggle */}
          <div>
            <label className="text-sm font-bold text-gray-900 block mb-2">Visit Type</label>
            <div className="flex bg-white p-1 rounded-lg border border-gray-200">
              <button 
                onClick={() => setLocationType("CLINIC")}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  locationType === "CLINIC" ? "bg-blue-100 text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                🏥 Clinic Visit
              </button>
              <button 
                onClick={() => setLocationType("HOME")}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  locationType === "HOME" ? "bg-blue-100 text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                🏠 Home Visit
              </button>
            </div>
          </div>

          {/* Address Input (Conditional) */}
          {locationType === "HOME" && (
            <div className="animate-fade-in">
              <label className="text-xs font-bold text-gray-700 block mb-1">Home Address</label>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete address..."
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
                rows={2}
              />
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-xs text-gray-500">Total for {duration} days</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalPrice}</p>
            </div>
          </div>
          <button
            onClick={handleBookClick}
            disabled={!selectedDate || !selectedSlot}
            className="w-full bg-gray-900 hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg"
          >
            Review & Pay
          </button>
        </div>
      </div>

      <BookingPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        specialist={specialist}
        date={selectedDate}
        slot={selectedSlot}
        duration={duration}
        locationType={locationType}
        address={address}
        totalPrice={totalPrice}
      />
    </>
  );
}