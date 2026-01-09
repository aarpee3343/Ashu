import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { addDays, subDays } from "date-fns";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const specialistId = Number(searchParams.get("specialistId"));
  const dateStr = searchParams.get("date");

  if (!specialistId || !dateStr) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const checkDate = new Date(dateStr);

  // 1. Check Direct Bookings (Same Day)
  const directBookings = await prisma.booking.findMany({
    where: {
      specialistId,
      date: checkDate,
      status: { not: "CANCELLED" }
    },
    select: { slotTime: true }
  });

  // 2. Check Overlapping Bookings (Multi-day)
  // Look back 30 days for any long-duration bookings that might still be active today
  const pastBookings = await prisma.booking.findMany({
    where: {
      specialistId,
      date: { lt: checkDate, gte: subDays(checkDate, 30) },
      status: { not: "CANCELLED" }
    },
    select: { date: true, duration: true, slotTime: true }
  });

  const overlapTimes = pastBookings
    .filter(b => {
      const endDate = addDays(new Date(b.date), b.duration);
      return endDate > checkDate; // If booking ends AFTER today, the slot is busy
    })
    .map(b => b.slotTime);

  // 3. Check Manually Blocked Slots (Doctor set unavailable)
  const manualBlocks = await prisma.slot.findMany({
    where: {
      specialistId,
      date: checkDate,
      isBooked: true // True = Blocked
    },
    select: { startTime: true }
  });

  // Combine all busy slots
  const busySet = new Set([
    ...directBookings.map(b => b.slotTime),
    ...overlapTimes,
    ...manualBlocks.map(s => s.startTime)
  ]);

  return NextResponse.json({ bookedSlots: Array.from(busySet) });
}