import speakeasy from "speakeasy";
import QRCode from "qrcode";
import CryptoJS from "crypto-js";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

const ENCRYPTION_KEY = process.env.TOTP_ENCRYPTION_KEY ?? "00000000000000000000000000000000";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Binboğa Kooperatif";

export function encryptSecret(secret: string): string {
  return CryptoJS.AES.encrypt(secret, ENCRYPTION_KEY).toString();
}

export function decryptSecret(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export function generateTOTPSecret(): string {
  return speakeasy.generateSecret({ length: 20 }).base32;
}

export async function generateQRCode(email: string, secret: string): Promise<string> {
  const otpauth = speakeasy.otpauthURL({
    secret,
    label: encodeURIComponent(email),
    issuer: APP_NAME,
    encoding: "base32",
  });
  return QRCode.toDataURL(otpauth);
}

export function verifyTOTP(token: string, encryptedSecret: string): boolean {
  try {
    const secret = decryptSecret(encryptedSecret);
    return speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1,
    });
  } catch {
    return false;
  }
}

export async function generateBackupCodes(): Promise<{ plain: string[]; hashed: string[] }> {
  const plain = Array.from({ length: 8 }, () =>
    randomBytes(4).toString("hex").toUpperCase()
  );
  const hashed = await Promise.all(plain.map((code) => bcrypt.hash(code, 10)));
  return { plain, hashed };
}

export async function verifyBackupCode(code: string, hashedCodes: string[]): Promise<number> {
  for (let i = 0; i < hashedCodes.length; i++) {
    if (await bcrypt.compare(code, hashedCodes[i])) return i;
  }
  return -1;
}
