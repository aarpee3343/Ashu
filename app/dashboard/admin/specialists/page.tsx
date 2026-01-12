import { prisma } from "@/lib/prisma";

export default async function AdminSpecialists() {
  const specialists = await prisma.specialist.findMany({
    orderBy: {
      id: 'desc' // Sorted by ID (Newest first)
    }
  });

  // Calculate stats
  const totalSpecialists = specialists.length;
  const featuredSpecialists = specialists.filter(s => s.isFeatured).length;
  
  // FIX: Changed 'isActive' to 'isVerified' to match your Schema
  const activeSpecialists = specialists.filter(s => s.isVerified).length;

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
        <p className="text-gray-600">Manage healthcare providers and their profiles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Specialists</p>
              <p className="text-3xl font-bold text-gray-900">{totalSpecialists}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👨‍⚕️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Featured</p>
              <p className="text-3xl font-bold text-yellow-600">{featuredSpecialists}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">⭐</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              {/* FIX: Label changed to Verified */}
              <p className="text-sm text-gray-500 mb-1">Verified</p>
              <p className="text-3xl font-bold text-green-600">{activeSpecialists}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-soft border border-gray-200 flex justify-between items-center">
        <div className="flex gap-3">
          <input 
            type="text" 
            placeholder="Search specialists..."
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand-500 w-64"
          />
          <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-brand-500">
            <option value="all">All Categories</option>
            <option value="PHYSIOTHERAPIST">Physiotherapist</option>
            <option value="NUTRITIONIST">Nutritionist</option>
            <option value="SPEECH_THERAPIST">Speech Therapist</option>
            <option value="DIETITIAN">Dietitian</option>
          </select>
        </div>
        <button className="px-6 py-2.5 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-lg font-medium transition-all hover:-translate-y-0.5 flex items-center gap-2">
          <span>+</span>
          <span>Add Specialist</span>
        </button>
      </div>

      {/* Specialists Table */}
      <div className="bg-white rounded-2xl shadow-soft border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Specialist</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Experience</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fee</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {specialists.map((specialist) => {
                const category = getCategoryBadge(specialist.category);
                return (
                  <tr key={specialist.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-brand-500 to-brand-600 rounded-lg flex items-center justify-center text-white font-semibold">
                          {specialist.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{specialist.name}</p>
                          <p className="text-xs text-gray-500">ID: {specialist.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${category.bg} ${category.color}`}>
                        {specialist.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {specialist.experience} years
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">
                        ₹{specialist.price}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium w-fit ${specialist.isFeatured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                          {specialist.isFeatured ? 'Featured' : 'Regular'}
                        </span>
                        
                        {/* FIX: Using 'isVerified' instead of 'isActive' */}
                        <span className={`px-2 py-1 rounded text-xs font-medium w-fit ${specialist.isVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {specialist.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg transition-colors">
                          View
                        </button>
                        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                          Edit
                        </button>
                        <button className="px-3 py-1 text-xs bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {specialists.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👨‍⚕️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Specialists Found</h3>
            <p className="text-gray-600 mb-6">Add healthcare specialists to start accepting appointments.</p>
            <button className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white rounded-lg font-medium transition-all hover:-translate-y-0.5">
              + Add First Specialist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}