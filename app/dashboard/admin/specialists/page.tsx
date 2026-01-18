import { prisma } from "@/lib/prisma";
import AsyncButton from "@/components/ui/AsyncButton";
import SpecialistActions from "./SpecialistActions"; // Import the new component
import { Search } from "lucide-react"; // Import icon

// ✅ FIX: Accept searchParams prop
export default async function AdminSpecialists({ 
  searchParams 
}: { 
  searchParams: { q?: string; cat?: string } 
}) {
  
  // 1. Build Filter Query
  const query: any = {};
  if (searchParams.q) {
    query.name = { contains: searchParams.q, mode: 'insensitive' };
  }
  if (searchParams.cat && searchParams.cat !== 'all') {
    query.category = searchParams.cat;
  }

  // 2. Fetch with Filters
  const specialists = await prisma.specialist.findMany({
    where: query,
    orderBy: { id: 'desc' }
  });

  // Calculate stats (based on total DB, not filtered view ideally, but this is fine for MVP)
  const allSpecs = await prisma.specialist.count();
  const featured = await prisma.specialist.count({ where: { isFeatured: true } });
  const verified = await prisma.specialist.count({ where: { isVerified: true } });

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, { color: string; bg: string }> = {
      'PHYSIOTHERAPIST': { color: 'text-blue-700', bg: 'bg-blue-100' },
      'NUTRITIONIST': { color: 'text-green-700', bg: 'bg-green-100' },
      'SPEECH_THERAPIST': { color: 'text-purple-700', bg: 'bg-purple-100' },
      'DIETITIAN': { color: 'text-yellow-700', bg: 'bg-yellow-100' }
    };
    return categoryMap[category] || { color: 'text-gray-700', bg: 'bg-gray-100' };
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Specialist Management</h1>
        <p className="text-gray-600">Verify, feature, and manage doctor profiles.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200 flex items-center justify-between">
           <div><p className="text-sm text-gray-500 mb-1">Total Specialists</p><p className="text-3xl font-bold text-gray-900">{allSpecs}</p></div>
           <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">👨‍⚕️</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200 flex items-center justify-between">
           <div><p className="text-sm text-gray-500 mb-1">Featured</p><p className="text-3xl font-bold text-yellow-600">{featured}</p></div>
           <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">⭐</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200 flex items-center justify-between">
           <div><p className="text-sm text-gray-500 mb-1">Verified</p><p className="text-3xl font-bold text-green-600">{verified}</p></div>
           <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">✅</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-soft border border-gray-200">
        <form className="flex flex-col md:flex-row gap-3">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                name="q"
                defaultValue={searchParams.q}
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 outline-none"
              />
           </div>
           <select name="cat" defaultValue={searchParams.cat} className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none">
             <option value="all">All Categories</option>
             <option value="PHYSIOTHERAPIST">Physiotherapist</option>
             <option value="NUTRITIONIST">Nutritionist</option>
             <option value="SPEECH_THERAPIST">Speech Therapist</option>
             <option value="DIETITIAN">Dietitian</option>
           </select>
           <button type="submit" className="bg-black text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
             Filter
           </button>
        </form>
      </div>

      {/* Specialists Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Specialist</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Stats</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {specialists.map((specialist) => {
                const category = getCategoryBadge(specialist.category);
                return (
                  <tr key={specialist.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                           {specialist.image ? (
                             <img src={specialist.image} alt={specialist.name} className="w-full h-full object-cover" />
                           ) : specialist.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{specialist.name}</p>
                          <p className="text-xs text-gray-500">{specialist.experience} Yrs Exp.</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.bg} ${category.color}`}>
                        {specialist.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900 font-medium">₹{specialist.price}</span>
                    </td>
                    <td className="px-6 py-4">
                       {/* Status Logic handled by Actions Component visual feedback */}
                       <span className={`px-2 py-1 rounded text-xs font-bold ${specialist.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {specialist.isVerified ? 'Verified' : 'Pending'}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                      {/* ✅ NEW: Interactive Actions Component */}
                      <SpecialistActions specialist={specialist} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {specialists.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No specialists found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}