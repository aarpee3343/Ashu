import { decryptFile } from "@/lib/crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { filename: string } }) {
  const session = await getServerSession(authOptions);
  
  // 🔒 STRICT SECURITY: Only Logged in users can view files
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const fileBuffer = await decryptFile(params.filename);
    
    // FIX: Cast fileBuffer to 'any' to satisfy TypeScript strict check
    return new NextResponse(fileBuffer as any, {
      headers: {
        "Content-Type": "application/pdf", // Or detect mime type dynamically
        "Content-Disposition": `inline; filename="${params.filename}"`
      }
    });
  } catch (e) {
    console.error(e);
    return new NextResponse("File not found or corrupted", { status: 404 });
  }
}