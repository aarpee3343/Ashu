import { prisma } from "@/lib/prisma";

export default async function UserBookings() {
  const bookings = await prisma.booking.findMany();
  return (
    <div>
      <h1>My Bookings</h1>
      {bookings.map(b => (
        <div key={b.id}>{b.status}</div>
      ))}
    </div>
  );
}
