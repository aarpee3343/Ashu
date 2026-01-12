import { addMinutes, format, parse, startOfDay, addHours } from "date-fns";

// 1. VIDEO: 15 Minute Slots
export const generateVideoSlots = () => {
  const slots = [];
  let currentTime = parse("10:00 AM", "h:mm a", new Date());
  const endTime = parse("05:00 PM", "h:mm a", new Date());

  while (currentTime < endTime) {
    slots.push(format(currentTime, "h:mm a"));
    currentTime = addMinutes(currentTime, 15);
  }
  return slots;
};

// 2. HOME: 1 Hour Slots
export const generateHomeSlots = () => {
  const slots = [];
  let currentTime = parse("07:00 AM", "h:mm a", new Date());
  const endTime = parse("06:00 PM", "h:mm a", new Date());

  while (currentTime < endTime) {
    slots.push(format(currentTime, "h:mm a"));
    currentTime = addHours(currentTime, 1);
  }
  return slots;
};

// 3. CLINIC: Flexible Windows (Standard)
export const generateClinicSlots = () => {
  return [
    "09:00 AM - 11:00 AM",
    "11:00 AM - 01:00 PM",
    "02:00 PM - 04:00 PM",
    "04:00 PM - 07:00 PM"
  ];
};