"use client";
import AsyncButton from "@/components/ui/AsyncButton";
export default function SlotPicker({ slots, onSelect }: any) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((slot: any) => (
        <AsyncButton
          key={slot.id}
          disabled={slot.isBooked}
          onClick={() => onSelect(slot)}
          className={`p-2 border rounded ${
            slot.isBooked ? "bg-gray-300" : "bg-green-100"
          }`}
        >
          {slot.startTime} - {slot.endTime}
        </AsyncButton>
      ))}
    </div>
  );
}
