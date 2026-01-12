import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  // FIX: Explicit session check
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { phone, age, gender } = body;

    const updatedUser = await prisma.user.update({
      where: { id: Number((session.user as any).id) }, // Cast ID for TS
      data: {
        phone,
        age: Number(age),
        gender
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}