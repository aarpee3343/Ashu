import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { encryptBuffer } from "@/lib/crypto";

// Force Node.js runtime
export const runtime = 'nodejs'; 

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename") || "file";
    const isPublic = searchParams.get("public") === "true";

    // 1. Security Check
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        { error: "Server Error: BLOB_READ_WRITE_TOKEN is missing" }, 
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 2. VALIDATION: Check if file is an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: "Only image files are allowed" }, 
        { status: 400 }
      );
    }

    // 3. VALIDATION: Check file size (5MB max)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" }, 
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer as ArrayBuffer);

    let finalBuffer: Uint8Array = buffer;
    let finalFilename = filename;

    // 4. Encryption Logic
    if (isPublic) {
        console.log(`📤 Uploading PUBLIC file: ${filename}`);
    } else {
        console.log(`🔒 Encrypting private file: ${filename}`);
        finalBuffer = encryptBuffer(buffer);
        finalFilename = filename + ".enc"; 
    }

    // 5. Upload to Vercel Blob with OVERWRITE enabled
    const blob = await put(finalFilename, finalBuffer, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      
      // CRITICAL: Allow overwriting existing files
      addRandomSuffix: false, 
      allowOverwrite: true, // ← THIS FIXES YOUR ERROR
      
      contentType: file.type, 
    });

    return NextResponse.json(blob);

  } catch (error: any) {
    console.error("❌ Upload Route Error:", error);
    
    return NextResponse.json(
      { error: error.message || "Upload failed" }, 
      { status: 500 }
    );
  }
}