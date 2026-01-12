import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password, age, gender, method } = body;

    // 1. Validation Logic
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    if (method === "EMAIL") {
      if (!email || !password) return NextResponse.json({ error: "Email & Password required" }, { status: 400 });
      // Check existing email
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    if (method === "PHONE") {
      if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });
      // Check existing phone
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) return NextResponse.json({ error: "Phone already registered" }, { status: 400 });
    }

    // 2. Prepare Data
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // 3. Create User
    const user = await prisma.user.create({
      data: {
        name,
        age: age ? Number(age) : null,
        gender,
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
        role: "USER"
      },
    });

    const { password: _, ...result } = user;
    return NextResponse.json(result);

  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}