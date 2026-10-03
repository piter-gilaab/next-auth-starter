import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import { createOpaqueToken, hashToken } from "./tokens";

const VERIFY_TTL_MS = 24 * 60 * 60 * 1000;

export function emailVerificationRequired(): boolean {
  return process.env.AUTH_REQUIRE_EMAIL_VERIFICATION === "true";
}

export async function issueVerificationToken(userId: string, email: string) {
  const token = createOpaqueToken();

  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId } }),
    prisma.emailVerificationToken.create({
      data: {
        tokenHash: hashToken(token),
        userId,
        expiresAt: new Date(Date.now() + VERIFY_TTL_MS),
      },
    }),
  ]);

  await sendVerificationEmail(email, token);
}

export async function verifyEmailToken(token: string): Promise<boolean> {
  const tokenHash = hashToken(token);
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.expiresAt <= new Date()) {
    if (record) {
      await prisma.emailVerificationToken.delete({ where: { id: record.id } });
    }
    return false;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.deleteMany({
      where: { userId: record.userId },
    }),
  ]);

  return true;
}
