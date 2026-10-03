import { createHash } from "node:crypto";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip") || "unknown";
}

async function keyFor(scope: string, identifier: string): Promise<string> {
  const ip = await clientIp();
  return createHash("sha256")
    .update(`${scope}:${ip}:${identifier.trim().toLowerCase()}`)
    .digest("hex");
}

export async function isRateLimited(
  scope: string,
  identifier: string,
  limit: number,
): Promise<boolean> {
  const key = await keyFor(scope, identifier);
  const row = await prisma.authRateLimit.findUnique({ where: { key } });

  if (!row) return false;
  if (row.resetAt <= new Date()) {
    await prisma.authRateLimit.delete({ where: { key } }).catch(() => undefined);
    return false;
  }

  return row.attempts >= limit;
}

export async function recordRateLimitAttempt(
  scope: string,
  identifier: string,
  windowMs: number,
): Promise<void> {
  const key = await keyFor(scope, identifier);
  const now = new Date();
  const existing = await prisma.authRateLimit.findUnique({ where: { key } });

  if (!existing || existing.resetAt <= now) {
    await prisma.authRateLimit.upsert({
      where: { key },
      create: { key, attempts: 1, resetAt: new Date(Date.now() + windowMs) },
      update: { attempts: 1, resetAt: new Date(Date.now() + windowMs) },
    });
    return;
  }

  await prisma.authRateLimit.update({
    where: { key },
    data: { attempts: { increment: 1 } },
  });
}

export async function clearRateLimit(
  scope: string,
  identifier: string,
): Promise<void> {
  const key = await keyFor(scope, identifier);
  await prisma.authRateLimit.delete({ where: { key } }).catch(() => undefined);
}
