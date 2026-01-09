import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const body = await req.json();
  const { logId, status } = body;

  const updatedLog = await prisma.dailyLog.update({
    where: { id: logId },
    data: { status }
  });

  return NextResponse.json(updatedLog);
}