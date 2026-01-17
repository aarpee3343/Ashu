import { prisma } from "@/lib/prisma";
import AsyncButton from "@/components/ui/AsyncButton";

export default async function AdminSlots() {
  const slots = await prisma.slot.findMany({
    include: {
      specialist: true,
      // Removed 'bookings: true' because the relation doesn't exist in your schema
    },
    orderBy: {
      date: 'asc' // Sorted by Date first, then you can sort by time if needed
    }
  });

  // Calculate stats
  const totalSlots = slots.length;
  const availableSlots = slots.filter(s => !s.isBooked).length;
  const bookedSlots = slots.filter(s => s.isBooked).length;
  
  // FIX: Compare dates correctly using the 'date' field
  const upcomingSlots = slots.filter(s => new Date(s.date) >= new Date()).length;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  // Helper to calculate duration roughly from strings (e.g. "10:00 AM" to "10:30 AM")
  // Since your schema stores time as strings, we display them directly.
  const getTimeDisplay = (start: string, end: string) => {
    return `${start} - ${end}`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Time Slot Management</h1>
        <p className="text-gray-600">Manage specialist availability and time slots</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Slots</p>
              <p className="text-3xl font-bold text-gray-900">{totalSlots}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⏰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Available</p>
              <p className="text-3xl font-bold text-green-600">{availableSlots}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Booked</p>
              <p className="text-3xl font-bold text-blue-600">{bookedSlots}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Upcoming</p>
              <p className="text-3xl font-bold text-purple-600">{upcomingSlots}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🚀</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-soft border border-gray-200 flex justify-between items-center">
        <div className="flex gap-3">
          <AsyncButton className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500">
             Filter by Date
          </AsyncButton>
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand-500">
            <option value="all">All Specialists</option>
            <option value="available">Available Only</option>
            <option value="booked">Booked Only</option>
          </select>
        </div>
        <div className="flex gap-3">
          <AsyncButton className="px-4 py-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5">
            + Add New Slot
          </AsyncButton>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {slots.map((slot) => (
          <div 
            key={slot.id} 
            className={`bg-white rounded-xl shadow-soft border ${slot.isBooked ? 'border-blue-200' : 'border-gray-200'} p-5 hover:shadow-lg transition-all`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{slot.specialist?.name || 'Unknown Specialist'}</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {slot.specialist?.category || 'N/A'}
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${slot.isBooked ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {slot.isBooked ? 'Booked' : 'Available'}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">📅</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{formatDate(slot.date)}</p>
                  <p className="text-xs text-gray-500">Date</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-500">⏰</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {getTimeDisplay(slot.startTime, slot.endTime)}
                  </p>
                  <p className="text-xs text-gray-500">Time</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <AsyncButton disabled={slot.isBooked} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${slot.isBooked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-brand-50 text-brand-700 hover:bg-brand-100'}`}>
                {slot.isBooked ? 'Reserved' : 'Available'}
              </AsyncButton>
              <AsyncButton className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                Edit
              </AsyncButton>
            </div>
          </div>
        ))}
      </div>

      {slots.length === 0 && (
        <div className="bg-white rounded-2xl shadow-soft border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Time Slots Found</h3>
          <p className="text-gray-600 mb-6">Create new time slots for specialists to start accepting appointments.</p>
        </div>
      )}
    </div>
  );
}