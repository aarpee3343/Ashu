import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, category, price, experience, bio, image, isVideoAvailable, videoConsultationFee } = body;

    // 1. Create User
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Transaction
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "SPECIALIST",
        },
      });

      await tx.specialist.create({
        data: {
          name,
          category,
          price: Number(price),
          experience: Number(experience),
          bio,
          image,
          userId: newUser.id,
          isVideoAvailable: isVideoAvailable || false,
          videoConsultationFee: videoConsultationFee ? Number(videoConsultationFee) : null,
          isVerified: true
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create doctor" }, { status: 500 });
  }
}