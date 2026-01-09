"use client";

export default function SlotPicker({ slots, onSelect }: any) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot: any) => (
        <button
          key={slot.id}
          disabled={slot.isBooked}
          onClick={() => onSelect(slot)}
          className={`p-2 border rounded ${
            slot.isBooked ? "bg-gray-300" : "bg-green-100"
          }`}
        >
          {slot.startTime} - {slot.endTime}
        </button>
      ))}
    </div>
  );
}
