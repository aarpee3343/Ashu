import { prisma } from "@/lib/prisma"; // <--- This import was missing
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { rating, comment, userId, specialistId } = await req.json();

    const review = await prisma.review.create({
      data: { 
        rating, 
        comment, 
        userId: Number(userId), 
        specialistId: Number(specialistId) 
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}