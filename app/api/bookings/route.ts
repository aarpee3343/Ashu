import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { addDays } from "date-fns";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId, specialistId, date, slotTime, totalPrice, amountPaid, paymentType,
      duration, locationType, visitAddress, clinicId, 
      medicalCondition, medicalDocs // <--- Captured here
    } = body;

    const doctor = await prisma.specialist.findUnique({ where: { id: specialistId } });
    const commissionRate = doctor?.commissionRate || 20; 
    const platformFee = Math.round((totalPrice * commissionRate) / 100);

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId: Number(userId),
          specialistId: Number(specialistId),
          date: new Date(date),
          slotTime,
          duration: Number(duration),
          locationType,
          visitAddress,
          clinicId: clinicId ? Number(clinicId) : null,
          totalPrice,
          amountPaid,
          paymentType,
          platformFee,
          status: "UPCOMING",
          // 👇 ADDED THESE LINES 👇
          medicalCondition: medicalCondition || "",
          medicalDocs: medicalDocs || ""
        },
      });

      // Mark Slot as Booked (Record = Blocked)
      // We create a slot record to represent this booking if one doesn't exist
      // or rely on the availability API to check the booking table directly (Better)
      
      // Generate Daily Logs
      const logs = [];
      for (let i = 0; i < duration; i++) {
        logs.push({
          bookingId: booking.id,
          date: addDays(new Date(date), i), 
          status: "PENDING"
        });
      }
      await tx.dailyLog.createMany({ data: logs });

      return booking;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Booking failed" }, { status: 500 });
  }
}