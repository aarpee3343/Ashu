import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    // 1. Security Check
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "SPECIALIST") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Body
    const body = await req.json();

    // 3. Database Update
    const updated = await prisma.specialist.update({
      where: { userId: Number((session.user as any).id) },
      data: {
        // Basic Fields with Fallbacks
        bio: body.bio || "",
        price: Number(body.price) || 0,
        experience: Number(body.experience) || 0,
        qualifications: body.qualifications || "",
        hospitals: body.hospitals || "",
        image: body.image, 
        isVideoAvailable: Boolean(body.isVideoAvailable),
        videoConsultationFee: Number(body.videoConsultationFee) || 0,

        // Rich Relations (Ensure arrays exist before mapping)
        educations: {
          deleteMany: {}, 
          create: body.educations?.map((e: any) => ({
             degree: e.degree || "",
             college: e.college || "",
             year: e.year || ""
          })) || []
        },
        awards: {
          deleteMany: {},
          create: body.awards?.map((a: any) => ({
             name: a.name || "",
             year: a.year || ""
          })) || []
        },
        memberships: {
          deleteMany: {},
          create: body.memberships?.map((m: any) => ({
             name: m.name || ""
          })) || []
        },
        registrations: {
          deleteMany: {},
          create: body.registrations?.map((r: any) => ({
             number: r.number || "",
             council: r.council || "",
             year: r.year || ""
          })) || []
        },
      }
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error("Profile Update Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}