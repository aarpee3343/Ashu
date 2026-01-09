// lib/getSpecialists.ts
import { prisma } from "./prisma";

export async function getSpecialists() {
  try {
    const specialists = await prisma.specialist.findMany({
      include: {
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
      where: {
        isVerified: true,
      },
      orderBy: [
        { isFeatured: 'desc' },
        { isPopular: 'desc' },
        { experience: 'desc' },
      ],
    });

    // Format the data
    const formattedSpecialists = specialists.map(specialist => {
      const totalRating = specialist.reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = specialist.reviews.length > 0 
        ? (totalRating / specialist.reviews.length).toFixed(1)
        : "4.5";

      return {
        id: specialist.id,
        name: specialist.name,
        category: specialist.category,
        bio: specialist.bio,
        qualifications: specialist.qualifications,
        experience: specialist.experience,
        price: specialist.price,
        image: specialist.image,
        isFeatured: specialist.isFeatured,
        isPopular: specialist.isPopular,
        rating: parseFloat(averageRating),
        reviewCount: specialist.reviews.length,
        email: specialist.user?.email || '',
        phone: specialist.user?.phone || '',
      };
    });

    return formattedSpecialists;
    
  } catch (error) {
    console.error('Error fetching specialists:', error);
    return [];
  }
}