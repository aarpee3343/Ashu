import { mockSpecialists } from "./mockData";

export async function getSpecialists() {
  try {
    const { prisma } = await import("./prisma");
    return await prisma.specialist.findMany();
  } catch (error) {
    console.warn("DB unavailable, using mock specialists");
    return mockSpecialists;
  }
}
