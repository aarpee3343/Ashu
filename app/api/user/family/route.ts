import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, relation, age, gender } = body;

    const member = await prisma.familyMember.create({
      data: {
        userId: Number((session.user as any).id),
        name,
        relation,
        age: Number(age),
        gender
      }
    });

    return NextResponse.json(member);
  } catch (error) {
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}