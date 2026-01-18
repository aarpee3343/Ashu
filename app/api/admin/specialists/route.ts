import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, action, data } = body; // 'data' contains the edit fields

    let updated;

    if (action === "VERIFY") {
      const current = await prisma.specialist.findUnique({ where: { id } });
      updated = await prisma.specialist.update({
        where: { id },
        data: { isVerified: !current?.isVerified }
      });
    } 
    
    else if (action === "FEATURE") {
      const current = await prisma.specialist.findUnique({ where: { id } });
      updated = await prisma.specialist.update({
        where: { id },
        data: { isFeatured: !current?.isFeatured }
      });
    }

    // ✅ NEW: Handle Edit Action
    else if (action === "UPDATE") {
        updated = await prisma.specialist.update({
            where: { id },
            data: {
                name: data.name,
                price: Number(data.price),
                category: data.category,
                experience: Number(data.experience)
            }
        });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}

// ... (DELETE function remains the same as previous) ...
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    await prisma.specialist.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}