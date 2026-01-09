import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, value } = await req.json();

  // Create new vital
  const vital = await prisma.vital.create({
    data: {
      userId: Number(session.user.id),
      type,
      value
    }
  });
  return NextResponse.json(vital);
}

export async function PUT(req: Request) {
  const { id, value } = await req.json();
  const vital = await prisma.vital.update({
    where: { id: Number(id) },
    data: { value }
  });
  return NextResponse.json(vital);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  await prisma.vital.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}