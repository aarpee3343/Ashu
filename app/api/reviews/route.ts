import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST: Create Review (Already exists, keep it)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rating, comment, userId, specialistId } = body;

    if (!userId || !specialistId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. GENUINE REVIEW CHECK
    // Find a booking that is COMPLETED and FULLY PAID
    const validBooking = await prisma.booking.findFirst({
      where: {
        userId: Number(userId),
        specialistId: Number(specialistId),
        status: "COMPLETED",
        amountPaid: {
            gte: prisma.booking.fields.totalPrice
        }
      }
    });

    if (!validBooking) {
      return NextResponse.json({ 
        error: "You can only review doctors after a completed and paid appointment." 
      }, { status: 403 });
    }

    // 2. Prevent Duplicate Reviews for same booking
    const existingReview = await prisma.review.findUnique({
        where: { bookingId: validBooking.id }
    });

    if (existingReview) {
        return NextResponse.json({ error: "You have already reviewed this appointment." }, { status: 409 });
    }

    // 3. Create Review
    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment: comment,
        userId: Number(userId),
        specialistId: Number(specialistId),
        bookingId: validBooking.id
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Review creation failed:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}

// NEW: PATCH Method to Edit Reviews
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { reviewId, rating, comment } = body;

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: Number(rating),
        comment: comment,
      }
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}