// app/dashboard/admin/page.tsx
import { prisma } from "@/lib/prisma";
import AsyncButton from "@/components/ui/AsyncButton";
import CreateDoctorForm from "./CreateDoctorForm"; // We'll extract the form logic

export default async function AdminDashboard() {
  // Fetch Real Stats
  const [totalDoctors, totalUsers, totalBookings, revenue] = await Promise.all([
    prisma.specialist.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.booking.count(),
    prisma.booking.aggregate({ _sum: { totalPrice: true } })
  ]);

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Admin Overview</h1>
        <p className="opacity-90">Here's what's happening on your platform today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Doctors" value={totalDoctors} icon="👨‍⚕️" color="blue" />
        <StatCard title="Total Patients" value={totalUsers} icon="👥" color="green" />
        <StatCard title="Appointments" value={totalBookings} icon="📅" color="purple" />
        <StatCard title="Total Revenue" value={`₹${revenue._sum.totalPrice || 0}`} icon="💰" color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create Specialist Form Column */}
        <div className="lg:col-span-2">
           <CreateDoctorForm />
        </div>

        {/* Quick Actions / Recent Logs Column */}
        <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-6 h-fit">
           <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
           <div className="space-y-3">
              <AsyncButton className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-medium transition">
                 📄 Generate Monthly Report
              </AsyncButton>
              <AsyncButton className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm font-medium transition">
                 ⚙️ Manage System Settings
              </AsyncButton>
           </div>
        </div>
      </div>
    </div>
  );
}

// Simple Stat Card Component
function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    yellow: "bg-yellow-50 text-yellow-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-soft border border-gray-200 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}