import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { subHours } from "date-fns";

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(req: Request) {
  try {
    // 1. Security Check (Optional but recommended)
    const authHeader = req.headers.get("authorization");
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    
    // Logic: If appointment was more than 5 hours ago and is still "UPCOMING"
    // We assume the doctor missed it or forgot to mark complete.
    const bufferTime = subHours(now, 5); 

    // 2. Update Database
    const skippedBookings = await prisma.booking.updateMany({
      where: {
        status: "UPCOMING",
        date: {
          lt: bufferTime // Date is older than 5 hours ago
        }
      },
      data: {
        status: "SKIPPED" // Mark as skipped
      }
    });

    return NextResponse.json({ 
      success: true, 
      skippedCount: skippedBookings.count,
      timestamp: now 
    });

  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}