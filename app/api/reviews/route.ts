import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rating, comment, userId, specialistId, bookingId } = body;

    if (!bookingId || !userId || !specialistId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment: comment,
        userId: Number(userId),
        specialistId: Number(specialistId),
        bookingId: Number(bookingId) // <--- This was missing!
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Review creation failed:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}