import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename") || "file.pdf";

  // ⚠️ Important: In a real app, verify 'request.body' exists
  if (!request.body) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Upload to Vercel Blob
  const blob = await put(filename, request.body, {
    access: "public",
  });

  return NextResponse.json(blob);
}