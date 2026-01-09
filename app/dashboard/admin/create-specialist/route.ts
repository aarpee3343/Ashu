import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, category, price, experience, bio, image } = body;

    // 1. Create User Account
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Transaction: Create User AND Specialist together
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
          userId: newUser.id, // Link to the user we just created
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create doctor" }, { status: 500 });
  }
}