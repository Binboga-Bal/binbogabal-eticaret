import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

export async function validatePassword(password: string): Promise<PasswordValidationResult> {
  const policy = await prisma.passwordPolicy.findFirst();
  const errors: string[] = [];

  if (!policy) return { valid: true, errors: [] };

  if (password.length < policy.minLength) {
    errors.push(`Şifre en az ${policy.minLength} karakter olmalıdır`);
  }
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("En az bir büyük harf içermelidir");
  }
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("En az bir küçük harf içermelidir");
  }
  if (policy.requireNumbers && !/\d/.test(password)) {
    errors.push("En az bir rakam içermelidir");
  }
  if (policy.requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
    errors.push("En az bir özel karakter içermelidir (!@#$% vb.)");
  }

  return { valid: errors.length === 0, errors };
}

export async function checkPasswordReuse(adminId: string, newPassword: string): Promise<boolean> {
  const policy = await prisma.passwordPolicy.findFirst();
  if (!policy || policy.preventReuse === 0) return false;

  const admin = await prisma.adminUser.findUnique({
    where: { id: adminId },
    select: { previousPasswords: true, passwordHash: true },
  });
  if (!admin) return false;

  const toCheck = [admin.passwordHash, ...admin.previousPasswords].slice(0, policy.preventReuse);
  for (const hash of toCheck) {
    if (await bcrypt.compare(newPassword, hash)) return true;
  }
  return false;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
