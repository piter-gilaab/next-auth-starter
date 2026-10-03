import prisma from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/mail";
import { hashPassword } from "./password";
import { createOpaqueToken, hashToken } from "./tokens";

const RESET_TTL_MS = 30 * 60 * 1000;

export async function issuePasswordResetToken(userId: string, email: string) {
  const token = createOpaqueToken();

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({ where: { userId } }),
    prisma.passwordResetToken.create({
      data: {
        tokenHash: hashToken(token),
        userId,
        expiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    }),
  ]);

  await sendPasswordResetEmail(email, token);
}

export async function resetPasswordWithToken(
  token: string,
  password: string,
): Promise<boolean> {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.expiresAt <= new Date()) {
    if (record) {
      await prisma.passwordResetToken.delete({ where: { id: record.id } });
    }
    return false;
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.session.deleteMany({ where: { userId: record.userId } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return true;
}
