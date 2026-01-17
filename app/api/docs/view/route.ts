import { NextResponse } from "next/server";
import { decryptBuffer } from "@/lib/crypto";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return new NextResponse("Missing URL", { status: 400 });
  }

  try {
    // 1. Fetch encrypted file
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error("Failed to fetch file");

    const encryptedArrayBuffer = await response.arrayBuffer();
    const encryptedBuffer = Buffer.from(encryptedArrayBuffer);

    // 2. Decrypt
    const decryptedBuffer = decryptBuffer(encryptedBuffer);

    // ✅ 3. Convert Buffer → Uint8Array (THIS FIXES THE ERROR)
    const body = new Uint8Array(decryptedBuffer);

    // 4. Content type detection
    let contentType = "application/pdf";
    if (fileUrl.endsWith(".png")) contentType = "image/png";
    if (fileUrl.endsWith(".jpg") || fileUrl.endsWith(".jpeg")) contentType = "image/jpeg";

    // 5. Return response
    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": "inline",
        "Content-Length": body.byteLength.toString(),
      },
    });

  } catch (error) {
    console.error("Decryption Error:", error);
    return new NextResponse("Error decrypting file", { status: 500 });
  }
}
