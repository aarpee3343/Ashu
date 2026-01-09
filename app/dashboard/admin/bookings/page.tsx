import { prisma } from "@/lib/prisma";

export default async function AdminBookings() {
  const bookings = await prisma.booking.findMany({ include: { user: true } });
  return (
    <div>
      <h1>Bookings</h1>
      {bookings.map(b => (
        <div key={b.id}>{b.user.name}</div>
      ))}
    </div>
  );
}
