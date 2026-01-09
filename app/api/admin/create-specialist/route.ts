// app/api/admin/create-specialist/route.ts

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, category, price, experience, bio, image } = body;

    // 0. Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // 1. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 2. Transaction
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
          commissionRate: Number(body.commissionRate || 20),
          isVerified: true
        },
      });
    });

    return NextResponse.json({ 
      success: true,
      message: "Specialist created successfully" 
    });
    
  } catch (error) {
    console.error('Create specialist error:', error);
    
    // Better error response
    return NextResponse.json(
      { 
        error: "Failed to create specialist",
        details: process.env.NODE_ENV === 'development' ? 
          (error instanceof Error ? error.message : 'Unknown error') : 
          undefined
      }, 
      { status: 500 }
    );
  }
}