import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const data = await req.json();
  const vital = await prisma.vital.create({ data });
  return Response.json(vital);
}
