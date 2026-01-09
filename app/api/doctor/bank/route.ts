import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // FIX: Explicitly check if session OR session.user is missing
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Now TypeScript knows session.user is defined
  const specialist = await prisma.specialist.findUnique({ 
    where: { userId: Number((session.user as any).id) }
  });

  if (!specialist) return NextResponse.json({ error: "No profile" }, { status: 404 });

  // Upsert logic (Create if new, Update if exists)
  const bank = await prisma.bankAccount.upsert({
    where: { specialistId: specialist.id },
    update: {
      accountHolder: body.accountHolder,
      accountNumber: body.accountNumber,
      bankName: body.bankName,
      ifscCode: body.ifscCode
    },
    create: {
      specialistId: specialist.id,
      accountHolder: body.accountHolder,
      accountNumber: body.accountNumber,
      bankName: body.bankName,
      ifscCode: body.ifscCode
    }
  });

  return NextResponse.json(bank);
}