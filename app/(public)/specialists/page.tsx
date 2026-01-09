import { prisma } from "@/lib/prisma";
import SpecialistCard from "@/components/SpecialistCard";
import { Category } from "@prisma/client";

// Force dynamic rendering so search params work on every request
export const dynamic = "force-dynamic";

export default async function SpecialistsPage({
  searchParams,
}: {
  searchParams: { category?: string; query?: string };
}) {
  const { category, query } = searchParams;
  const where: any = {};

  // 1. SMART CATEGORY MAPPING
  // This fixes the blank page issue by mapping "Nutrition" -> "NUTRITIONIST"
  if (category) {
    const cleanCat = category.trim().toUpperCase().replace(/\s+/g, "_");
    
    // Check if it's a valid enum, otherwise try to fuzzy match
    if (Object.values(Category).includes(cleanCat as Category)) {
      where.category = cleanCat as Category;
    } else {
      // Fallback: If URL says "Nutrition", map it to NUTRITIONIST manually
      if (cleanCat.includes("NUTRITION")) where.category = "NUTRITIONIST";
      else if (cleanCat.includes("PHYSIO")) where.category = "PHYSIOTHERAPIST";
      else if (cleanCat.includes("SPEECH")) where.category = "SPEECH_THERAPIST";
      else if (cleanCat.includes("DIET")) where.category = "DIETITIAN";
    }
  }

  // 2. SEARCH QUERY LOGIC
  if (query) {
    where.OR = [
      { name: { contains: query } }, 
      { bio: { contains: query } },
      { category: { equals: query.toUpperCase() as any } } // Allow searching "Physio" in text box
    ];
  }

  // 3. FETCH DATA
  // We use a try-catch block to prevent the "White Screen of Death" if DB fails
  let specialists = [];
  try {
    specialists = await prisma.specialist.findMany({
      where,
      orderBy: { isFeatured: "desc" },
    });
  } catch (error) {
    console.error("Database Error:", error);
    // If exact match fails, fetch ALL so the page isn't blank
    specialists = await prisma.specialist.findMany({ take: 10 });
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {category 
              ? `${category}s` 
              : query 
                ? `Search results for "${query}"`
                : "All Specialists"}
          </h1>
          <p className="text-gray-500 mt-2">
            Found {specialists.length} doctors.
          </p>
        </div>

        {/* The Grid */}
        {specialists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialists.map((specialist) => (
              <SpecialistCard key={specialist.id} specialist={specialist} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
            <p className="text-xl text-gray-500">No specialists found.</p>
            <a href="/specialists" className="text-blue-600 font-semibold mt-4 inline-block hover:underline">
              View All Doctors
            </a>
          </div>
        )}
      </div>
    </div>
  );
}