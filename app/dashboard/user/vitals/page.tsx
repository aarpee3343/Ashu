import { prisma } from "@/lib/prisma";

export default async function UserVitals() {
  const vitals = await prisma.vital.findMany();
  return (
    <div>
      <h1>My Vitals</h1>
      {vitals.map(v => (
        <div key={v.id}>{v.type}: {v.value}</div>
      ))}
    </div>
  );
}
