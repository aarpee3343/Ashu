import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  // 1. Security Check
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "SPECIALIST") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { logId, status } = body;

  // 2. Validate Ownership
  // Find the log and check if the booking belongs to this specialist
  const log = await prisma.dailyLog.findUnique({
    where: { id: logId },
    include: { booking: true }
  });

  if (!log) return NextResponse.json({ error: "Log not found" }, { status: 404 });

  // Verify the booking's specialistId matches the logged-in user's specialist profile
  const specialist = await prisma.specialist.findUnique({
    where: { userId: Number((session.user as any).id) }
  });

  if (!specialist || log.booking.specialistId !== specialist.id) {
    return NextResponse.json({ error: "Access Denied: Not your booking" }, { status: 403 });
  }

  // 3. Update Status
  const updatedLog = await prisma.dailyLog.update({
    where: { id: logId },
    data: { status }
  });

  return NextResponse.json(updatedLog);
}