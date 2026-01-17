import crypto from "crypto";
import fs from "fs/promises";
import path from "path";

const ALGORITHM = "aes-256-cbc";
const FALLBACK_KEY = "b6Jw4N2k9ZpF7mE3QxA8sfg87arVYcK1";
const SECRET_KEY = process.env.ENCRYPTION_KEY || FALLBACK_KEY;
const IV_LENGTH = 16;

// ───────────────────────────────────────────────
// Buffer-level helpers (already correct)
// ───────────────────────────────────────────────

export function encryptBuffer(buffer: Buffer | Uint8Array): Buffer {
  if (Buffer.from(SECRET_KEY).length !== 32) {
    throw new Error("ENCRYPTION_KEY must be exactly 32 characters long");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(SECRET_KEY),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(buffer)),
    cipher.final(),
  ]);

  return Buffer.concat([iv, encrypted]);
}

export function decryptBuffer(buffer: Buffer | Uint8Array): Buffer {
  const data = Buffer.from(buffer);

  const iv = data.subarray(0, IV_LENGTH);
  const encryptedData = data.subarray(IV_LENGTH);

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(SECRET_KEY),
    iv
  );

  return Buffer.concat([
    decipher.update(encryptedData),
    decipher.final(),
  ]);
}


// ───────────────────────────────────────────────
// ✅ FILE-LEVEL helper (THIS WAS MISSING)
// ───────────────────────────────────────────────

export async function decryptFile(filename: string): Promise<Buffer> {
  // Example: files stored in /uploads (adjust if needed)
  const filePath = path.join(process.cwd(), "uploads", filename);

  const encryptedFile = await fs.readFile(filePath);
  return decryptBuffer(encryptedFile);
}
