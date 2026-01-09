import { prisma } from "@/lib/prisma";

export default async function AdminSlots() {
  const slots = await prisma.slot.findMany();
  return (
    <div>
      <h1>Slots</h1>
      {slots.map(s => (
        <div key={s.id}>{s.startTime}</div>
      ))}
    </div>
  );
}
