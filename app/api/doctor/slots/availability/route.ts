import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { addDays, subDays } from "date-fns";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const specialistId = Number(searchParams.get("specialistId"));
  const dateStr = searchParams.get("date");

  if (!specialistId || !dateStr) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const checkDate = new Date(dateStr);

  // 1. Get Patient Bookings (Direct)
  const bookings = await prisma.booking.findMany({
    where: {
      specialistId,
      date: checkDate,
      status: { not: "CANCELLED" }
    },
    select: { slotTime: true }
  });

  // 2. Get Multi-day Overlaps (The "Smart" Check)
  // Check bookings starting up to 30 days ago to see if their duration covers today
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
      return endDate > checkDate; // If booking ends AFTER today, it blocks today
    })
    .map(b => b.slotTime);

  // 3. Get Doctor Manual Blocks (The Slots Table)
  const blockedSlots = await prisma.slot.findMany({
    where: {
      specialistId,
      date: checkDate,
      isBooked: true
    },
    select: { startTime: true }
  });

  // Combine all busy times
  const busyTimes = new Set([
    ...bookings.map(b => b.slotTime),
    ...overlapTimes,
    ...blockedSlots.map(s => s.startTime)
  ]);

  return NextResponse.json({ bookedSlots: Array.from(busyTimes) });
}