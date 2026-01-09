import { NextResponse } from "next/server";
import { encryptAndSaveFile } from "@/lib/crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    // Encrypt and save to disk
    const filename = await encryptAndSaveFile(file);

    // Return the SECURE URL (User can't open this without login)
    return NextResponse.json({ 
      url: `/api/files/${filename}`, 
      success: true 
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}