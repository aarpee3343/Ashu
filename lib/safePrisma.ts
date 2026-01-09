import { prisma } from "./prisma";

export async function safeQuery<T>(
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.warn("DB unavailable, using fallback");
    return fallback;
  }
}
