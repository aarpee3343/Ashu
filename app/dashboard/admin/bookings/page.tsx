import { prisma } from "@/lib/prisma";

export default async function AdminBookings() {
  const bookings = await prisma.booking.findMany({
    include: { 
      user: true,
      specialist: true,
      // slot: true <--- REMOVED (Not in schema)
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50
  });

  // Calculate stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(b => b.status === 'UPCOMING').length; // Changed 'PENDING' to 'UPCOMING' based on your enum
  const confirmedBookings = bookings.filter(b => b.status === 'COMPLETED').length; // Adjust based on your actual flow
  const cancelledBookings = bookings.filter(b => b.status === 'CANCELLED').length;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; bg: string; text: string }> = {
      'UPCOMING': { color: 'text-blue-700', bg: 'bg-blue-100', text: 'Upcoming' },
      'COMPLETED': { color: 'text-green-700', bg: 'bg-green-100', text: 'Completed' },
      'CANCELLED': { color: 'text-red-700', bg: 'bg-red-100', text: 'Cancelled' }
    };
    
    return statusMap[status] || { color: 'text-gray-700', bg: 'bg-gray-100', text: status };
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Appointment Management</h1>
        <p className="text-gray-600">View and manage all patient appointments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-900">{totalBookings}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Upcoming</p>
              <p className="text-3xl font-bold text-yellow-600">{pendingBookings}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Completed</p>
              <p className="text-3xl font-bold text-green-600">{confirmedBookings}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Cancelled</p>
              <p className="text-3xl font-bold text-red-600">{cancelledBookings}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🚫</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Recent Appointments</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Specialist</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => {
                const status = getStatusBadge(booking.status);
                return (
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.user?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{booking.user?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{booking.specialist?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{booking.specialist?.category || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-900">{formatDate(booking.date)}</p>
                        {/* FIX: Use booking.slotTime directly */}
                        <p className="text-xs text-gray-500">{booking.slotTime}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        ₹{booking.totalPrice || '0'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}