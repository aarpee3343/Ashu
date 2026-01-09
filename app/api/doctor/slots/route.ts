import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { date, time, action } = body; 

  const specialist = await prisma.specialist.findUnique({ where: { userId: Number((session.user as any).id) } });

  if (action === "BLOCK") {
    // Check if already blocked to avoid duplicates
    const existing = await prisma.slot.findFirst({
      where: { specialistId: specialist!.id, date: new Date(date), startTime: time }
    });

    if (!existing) {
      await prisma.slot.create({
        data: {
          specialistId: specialist!.id,
          date: new Date(date),
          startTime: time,
          endTime: time,
          isBooked: true // Mark as Blocked
        }
      });
    }
  } 
  else if (action === "OPEN") {
    // Delete the manual block
    await prisma.slot.deleteMany({
      where: {
        specialistId: specialist!.id,
        date: new Date(date),
        startTime: time
      }
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const body = await req.json();
  const { date } = body;
  const specialist = await prisma.specialist.findUnique({ where: { userId: Number((session.user as any).id) } });

  // Clear all manual blocks for this day
  await prisma.slot.deleteMany({
    where: {
      specialistId: specialist!.id,
      date: new Date(date)
    }
  });

  return NextResponse.json({ success: true });
}