import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Role } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";
import { createOpaqueToken, hashToken } from "./tokens";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

function cookieName() {
  return process.env.SESSION_COOKIE_NAME || "auth_session";
}

export async function createSession(userId: string): Promise<void> {
  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      tokenHash: hashToken(token),
      userId,
      expiresAt,
    },
  });

  const store = await cookies();
  store.set(cookieName(), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroyCurrentSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(cookieName())?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }

  store.delete(cookieName());
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(cookieName());
}

export async function getCurrentUser() {
  const store = await cookies();
  const token = store.get(cookieName())?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt <= new Date()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => undefined);
    store.delete(cookieName());
    return null;
  }

  return session.user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: Role) {
  const user = await requireUser();
  if (user.role !== role) redirect("/dashboard");
  return user;
}
