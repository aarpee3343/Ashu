import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Auth required" }, { status: 401 });

  const body = await req.json();
  const specialist = await prisma.specialist.findUnique({ where: { userId: Number(session.user.id) } });

  if (!specialist) return NextResponse.json({ error: "Doctor not found" }, { status: 404 });

  const clinic = await prisma.clinic.create({
    data: {
      specialistId: specialist.id,
      name: body.name,
      address: body.address,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      district: body.city // assuming same for simplicity
    }
  });

  return NextResponse.json(clinic);
}