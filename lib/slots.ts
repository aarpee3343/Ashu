import { addMinutes, format, parse, addHours, isToday, isBefore, startOfHour } from "date-fns";

export const generateVideoSlots = (date: Date = new Date()) => {
  const slots = [];
  const now = new Date();
  
  // Start 10 AM, End 9 PM
  let currentTime = parse("10:00 AM", "h:mm a", date);
  const endTime = parse("09:00 PM", "h:mm a", date);

  while (currentTime < endTime) {
    // If date is today, ONLY show future slots (with 30 min buffer)
    if (!isToday(date) || isBefore(addMinutes(now, 30), currentTime)) {
      slots.push(format(currentTime, "h:mm a"));
    }
    currentTime = addMinutes(currentTime, 15);
  }
  return slots;
};

export const generateHomeSlots = (date: Date = new Date()) => {
  const slots = [];
  const now = new Date();
  
  let currentTime = parse("07:00 AM", "h:mm a", date);
  const endTime = parse("07:00 PM", "h:mm a", date);

  while (currentTime < endTime) {
    if (!isToday(date) || isBefore(addMinutes(now, 60), currentTime)) {
      slots.push(format(currentTime, "h:mm a"));
    }
    currentTime = addHours(currentTime, 1);
  }
  return slots;
};

// ... clinic slots logic remains similar (custom strings are harder to filter automatically without parsing)
export const generateClinicSlots = () => {
    return ["09:00 - 11:00", "11:00 - 13:00", "14:00 - 16:00", "16:00 - 19:00"];
}