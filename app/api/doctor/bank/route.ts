import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const specialist = await prisma.specialist.findUnique({ where: { userId: Number(session.user.id) } });

  if (!specialist) return NextResponse.json({ error: "No profile" }, { status: 404 });

  // Upsert (Create or Update)
  const bank = await prisma.bankAccount.upsert({
    where: { specialistId: specialist.id },
    update: body,
    create: { ...body, specialistId: specialist.id }
  });

  return NextResponse.json(bank);
}