import { prisma } from "@/lib/prisma";

export default async function AdminPatients() {
  const patients = await prisma.user.findMany({
    where: { role: 'USER' },
    include: { bookings: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Patient Management</h1>
        <p className="text-gray-600">View registered patients and their history</p>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Patient</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Total Bookings</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {patient.name?.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{patient.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p>{patient.email}</p>
                      <p className="text-gray-500">{patient.phone || 'No phone'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold text-gray-700">
                      {patient.bookings.length} Bookings
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(patient.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}