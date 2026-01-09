import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.ENCRYPTION_KEY || "12345678901234567890123456789012"; // 32 chars
const IV_LENGTH = 16;

export async function encryptAndSaveFile(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.enc`;
  const filePath = path.join(process.cwd(), 'private-uploads', filename);

  // Save IV + Encrypted Data
  const finalBuffer = Buffer.concat([iv, encrypted]);
  await fs.promises.writeFile(filePath, finalBuffer);

  return filename;
}

export async function decryptFile(filename: string): Promise<Buffer> {
  const filePath = path.join(process.cwd(), 'private-uploads', filename);
  const fileBuffer = await fs.promises.readFile(filePath);

  // Extract IV (first 16 bytes) and Data
  const iv = fileBuffer.subarray(0, IV_LENGTH);
  const encryptedData = fileBuffer.subarray(IV_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

  return decrypted;
}