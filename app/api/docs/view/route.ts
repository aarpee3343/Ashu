import { NextResponse } from "next/server";
import { decryptBuffer } from "@/lib/crypto";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) return new NextResponse("Missing URL", { status: 400 });

  try {
    // 1. Fetch the Encrypted File from Vercel Blob
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Failed to fetch file");

    const encryptedArrayBuffer = await response.arrayBuffer();
    const encryptedBuffer = Buffer.from(encryptedArrayBuffer);

    // 2. Decrypt it
    const decryptedBuffer = decryptBuffer(encryptedBuffer);

    // 3. Determine Content Type (Basic detection)
    let contentType = "application/pdf"; // Default
    if (fileUrl.endsWith(".png") || fileUrl.endsWith(".jpg") || fileUrl.endsWith(".jpeg")) {
        contentType = "image/jpeg";
    }

    // 4. Return the Clean File to the Browser
    return new NextResponse(decryptedBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline", // Open in browser instead of download
      },
    });

  } catch (error) {
    console.error("Decryption Error:", error);
    return new NextResponse("Error decrypting file", { status: 500 });
  }
}