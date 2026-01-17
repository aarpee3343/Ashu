import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

// FIX: This key MUST be exactly 32 characters long for aes-256
// I have sliced your original key to fit the requirement.
const FALLBACK_KEY = "b6Jw4N2k9ZpF7mE3QxA8sfg87arVYcK1"; 

const SECRET_KEY = process.env.ENCRYPTION_KEY || FALLBACK_KEY; 
const IV_LENGTH = 16;

export function encryptBuffer(buffer: Buffer): Buffer {
  // Double check key length to prevent server crash
  if (Buffer.from(SECRET_KEY).length !== 32) {
      throw new Error("ENCRYPTION_KEY must be exactly 32 characters long");
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, encrypted]);
}

export function decryptBuffer(encryptedBuffer: Buffer): Buffer {
  const iv = encryptedBuffer.subarray(0, IV_LENGTH);
  const encryptedData = encryptedBuffer.subarray(IV_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY), iv);
  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);

  return decrypted;
}