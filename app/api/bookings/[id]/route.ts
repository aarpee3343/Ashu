import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const bookingId = Number(params.id);
    const body = await req.json();
    const { action } = body; // action: UPDATE_STATUS | CANCEL | PAY_BALANCE

    /* ---------------- UPDATE STATUS (COMPLETION) ---------------- */
    if (action === "UPDATE_STATUS") {
      const { status, prescription, amountCollected } = body;

      const dataToUpdate: any = { status };

      if (prescription) {
        dataToUpdate.prescription = prescription;
      }

      // ✅ NEW: Save collected cash amount (for PAY_ON_SERVICE)
      if (amountCollected !== undefined) {
        dataToUpdate.amountPaid = Number(amountCollected);
      }

      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: dataToUpdate,
      });

      return NextResponse.json(updated);
    }

    /* ---------------- CANCEL BOOKING ---------------- */
    if (action === "CANCEL") {
      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED" },
      });

      // Free up the slot
      await prisma.slot.updateMany({
        where: {
          specialistId: updated.specialistId,
          date: updated.date,
          startTime: updated.slotTime,
        },
        data: { isBooked: false },
      });

      return NextResponse.json(updated);
    }

    /* ---------------- PAY BALANCE (ONLINE) ---------------- */
    if (action === "PAY_BALANCE") {
      const current = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!current) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      const updated = await prisma.booking.update({
        where: { id: bookingId },
        data: { amountPaid: current.totalPrice },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
