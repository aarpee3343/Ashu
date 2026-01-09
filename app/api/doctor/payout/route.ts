import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const specialist = await prisma.specialist.findUnique({ where: { userId: Number((session.user as any).id) } });

  const payout = await prisma.payoutRequest.create({
    data: {
      specialistId: specialist!.id,
      amount: body.amount,
      status: "PENDING"
    }
  });

  return NextResponse.json(payout);
}