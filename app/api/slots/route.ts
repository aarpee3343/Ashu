import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const data = await req.json();
  const slot = await prisma.slot.create({ data });
  return Response.json(slot);
}
