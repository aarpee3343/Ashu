import { prisma } from "@/lib/prisma";
import SpecialistCard from "@/components/SpecialistCard";
import Navbar from "@/components/Navbar";

// Force dynamic rendering so new doctors show up instantly
export const dynamic = "force-dynamic";

export default async function SpecialistsPage({ searchParams }: { searchParams: { category?: string } }) {
  // 1. Build Filter Logic
  const where: any = {
    isVerified: true, // Only show verified doctors
  };

  // Optional: Filter by Category if URL has ?category=NUTRITIONIST
  if (searchParams.category) {
    where.category = searchParams.category;
  }

  // 2. Fetch Specialists
  const specialists = await prisma.specialist.findMany({
    where,
    orderBy: {
      isFeatured: 'desc', // Featured doctors first
    },
    include: {
      reviews: true, // Fetch reviews to calculate rating if needed
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      
      {/* Header Section */}
      <div className="bg-white border-b py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Find Top Specialists
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Book appointments with verified doctors, nutritionists, and therapists. 
            Choose between clinic visits or online video consultations.
          </p>
        </div>
      </div>

      {/* Grid Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {specialists.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-6xl mb-4">👨‍⚕️</div>
            <h3 className="text-xl font-bold text-gray-900">No Specialists Found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialists.map((specialist) => (
              <SpecialistCard 
                key={specialist.id} 
                specialist={specialist} // Pass the data prop
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}