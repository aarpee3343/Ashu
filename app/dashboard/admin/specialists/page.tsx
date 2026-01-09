import { prisma } from "@/lib/prisma"; // <--- Add this line at the top

export default async function AdminSpecialists() {
  const specialists = await prisma.specialist.findMany();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Specialists</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 font-semibold text-gray-700">Name</th>
              <th className="p-4 font-semibold text-gray-700">Category</th>
              <th className="p-4 font-semibold text-gray-700">Featured</th>
              <th className="p-4 font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {specialists.map((s) => (
              <tr key={s.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                <td className="p-4">{s.name}</td>
                <td className="p-4">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
                    {s.category}
                  </span>
                </td>
                <td className="p-4">
                  {s.isFeatured ? (
                    <span className="text-green-600 font-bold">Yes</span>
                  ) : (
                    <span className="text-gray-400">No</span>
                  )}
                </td>
                <td className="p-4">
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}