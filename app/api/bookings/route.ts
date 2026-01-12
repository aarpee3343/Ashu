import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { addDays, subMinutes } from "date-fns";
import { sendBookingConfirmation } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      userId, specialistId, date, slotTime, totalPrice, 
      paymentType, duration, locationType, visitAddress, 
      familyMemberId, transactionId, clinicId, amountPaid
    } = body;

    // --- 1. RATE LIMITING (Spam Protection) ---
    // Prevent user from making more than 3 bookings in 1 minute
    const recentBookings = await prisma.booking.count({
      where: {
        userId: Number(userId),
        createdAt: {
          gte: subMinutes(new Date(), 1) // Bookings in last 1 minute
        }
      }
    });

    if (recentBookings >= 3) {
      return NextResponse.json({ error: "You are booking too fast. Please wait." }, { status: 429 });
    }

    // --- 2. INPUT VALIDATION ---
    if (!userId || !specialistId || !date || !slotTime) {
      return NextResponse.json({ error: "Missing required booking details" }, { status: 400 });
    }

    // --- 3. DATABASE TRANSACTION ---
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Check for Double Booking (Race Condition)
      const existingBooking = await tx.booking.findFirst({
        where: {
          specialistId: Number(specialistId),
          date: new Date(date),
          slotTime: slotTime,
          status: { not: "CANCELLED" }, 
        },
      });

      if (existingBooking) {
        throw new Error("SLOT_TAKEN");
      }

      // B. Create Booking
      const booking = await tx.booking.create({
        data: {
          userId: Number(userId),
          specialistId: Number(specialistId),
          date: new Date(date),
          slotTime,
          duration: Number(duration || 1),
          locationType,
          visitAddress,
          totalPrice,
          amountPaid: Number(amountPaid), // 0 for Cash, Full for Online
          paymentType, 
          status: "UPCOMING",
          familyMemberId: familyMemberId ? Number(familyMemberId) : null,
          clinicId: clinicId ? Number(clinicId) : null,
          medicalCondition: transactionId ? `UTR: ${transactionId}` : "Pay Later", 
        },
        include: { specialist: true, user: true }
      });

      // C. Generate Logs
      const logs = [];
      const days = Number(duration || 1);
      for (let i = 0; i < days; i++) {
        logs.push({
          bookingId: booking.id,
          date: addDays(new Date(date), i), 
          status: "PENDING"
        });
      }
      await tx.dailyLog.createMany({ data: logs });

      return booking;
    });

    // --- 4. SEND EMAIL (Async) ---
    // We don't await this to keep the API response fast
    sendBookingConfirmation(result, result.user, result.specialist).catch(err => console.error("Email failed", err));

    return NextResponse.json(result);

  } catch (error: any) {
    console.error("Booking API Error:", error);
    
    if (error.message === "SLOT_TAKEN") {
      return NextResponse.json({ error: "This slot was just booked by someone else." }, { status: 409 });
    }

    return NextResponse.json({ 
      error: "Internal Server Error", 
      details: error.message 
    }, { status: 500 });
  }
}