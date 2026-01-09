import { prisma } from "@/lib/prisma";
import Link from "next/link";
import CreateDoctorForm from "./CreateDoctorForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  // 🔒 SECURITY CHECK: Only ADMINs allowed
  if (!session || (session.user as any).role !== "ADMIN") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 text-red-700">
        <h1 className="text-3xl font-bold mb-2">⛔ Access Denied</h1>
        <p className="mb-6">You do not have permission to view the Admin Dashboard.</p>
        <Link href="/dashboard" className="bg-red-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-800">
          Go Back to My Dashboard
        </Link>
      </div>
    );
  }
  // Fetch Stats
  const stats = {
    users: await prisma.user.count(),
    doctors: await prisma.specialist.count(),
    bookings: await prisma.booking.count(),
    revenue: (await prisma.booking.aggregate({ _sum: { amountPaid: true } }))._sum.amountPaid || 0,
  };

  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: true, specialist: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* 1. Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Users", value: stats.users, color: "bg-blue-50 text-blue-600" },
            { label: "Total Doctors", value: stats.doctors, color: "bg-purple-50 text-purple-600" },
            { label: "Total Bookings", value: stats.bookings, color: "bg-orange-50 text-orange-600" },
            { label: "Total Revenue", value: `₹${stats.revenue}`, color: "bg-green-50 text-green-600" },
          ].map((stat, i) => (
            <div key={i} className={`p-6 rounded-2xl border border-gray-100 shadow-sm ${stat.color}`}>
              <p className="text-sm font-bold opacity-70 uppercase">{stat.label}</p>
              <p className="text-3xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* 2. Create Doctor Section */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Add New Specialist</h2>
              <p className="text-sm text-gray-500 mb-6">
                This will create a login account and a public profile for the doctor.
              </p>
              <CreateDoctorForm />
            </div>
          </div>

          {/* 3. Recent Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Recent Bookings</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="p-3">Patient</th>
                      <th className="p-3">Doctor</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentBookings.map((b) => (
                      <tr key={b.id} className="text-sm">
                        <td className="p-3 font-medium">{b.user.name}</td>
                        <td className="p-3">{b.specialist.name}</td>
                        <td className="p-3">{new Date(b.date).toLocaleDateString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            b.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' : 
                            b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}