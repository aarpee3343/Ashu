import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    // 1. Security Check
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SPECIALIST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Body
    const body = await req.json();

    // 3. Database Update
    const updated = await prisma.specialist.update({
      where: { userId: Number(session.user.id) },
      data: {
        bio: body.bio,
        price: Number(body.price),
        experience: Number(body.experience),
        qualifications: body.qualifications,
        hospitals: body.hospitals,
        image: body.image,
        // Optional: Add updated checks here if needed
      }
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}