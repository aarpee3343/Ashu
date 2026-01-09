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
    
    // Return file as a stream (PDF/Image)
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf", // Or detect mime type dynamically
        "Content-Disposition": `inline; filename="${params.filename}"`
      }
    });
  } catch (e) {
    return new NextResponse("File not found or corrupted", { status: 404 });
  }
}