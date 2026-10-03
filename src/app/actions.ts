"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  changePasswordSchema,
  emailSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/auth/validation";
import {
  clearSessionCookie,
  createSession,
  destroyCurrentSession,
  requireUser,
} from "@/lib/auth/session";
import {
  clearRateLimit,
  isRateLimited,
  recordRateLimitAttempt,
} from "@/lib/auth/rate-limit";
import {
  emailVerificationRequired,
  issueVerificationToken,
  verifyEmailToken,
} from "@/lib/auth/email-verification";
import {
  issuePasswordResetToken,
  resetPasswordWithToken,
} from "@/lib/auth/password-reset";

export type ActionState = {
  error?: string;
  success?: string;
};

function firstIssue(error: { issues: Array<{ message: string }> }) {
  return error.issues[0]?.message || "Invalid form data.";
}

export async function registerAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existing) return { error: "An account with this email already exists." };

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash: await hashPassword(parsed.data.password),
    },
  });

  if (emailVerificationRequired()) {
    try {
      await issueVerificationToken(user.id, user.email);
    } catch (error) {
      console.error("Could not send verification email", error);
      return {
        error:
          "Account created, but the verification email could not be sent. Use the resend verification page.",
      };
    }

    return {
      success: "Account created. Check your email to verify it before signing in.",
    };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) return { error: firstIssue(parsed.error) };

  if (await isRateLimited("login", parsed.data.email, 5)) {
    return { error: "Too many attempts. Try again in about 15 minutes." };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  const valid =
    user && (await verifyPassword(parsed.data.password, user.passwordHash));

  if (!user || !valid) {
    await recordRateLimitAttempt("login", parsed.data.email, 15 * 60 * 1000);
    return { error: "Invalid email or password." };
  }

  if (emailVerificationRequired() && !user.emailVerifiedAt) {
    return { error: "Verify your email before signing in." };
  }

  await clearRateLimit("login", parsed.data.email);
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroyCurrentSession();
  redirect("/");
}

export async function requestPasswordResetAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  if (await isRateLimited("password-reset", parsed.data.email, 3)) {
    return {
      success:
        "If an account exists for that email, a password reset link has been sent.",
    };
  }

  await recordRateLimitAttempt(
    "password-reset",
    parsed.data.email,
    15 * 60 * 1000,
  );

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (user) {
    try {
      await issuePasswordResetToken(user.id, user.email);
    } catch (error) {
      console.error("Could not send password reset email", error);
    }
  }

  return {
    success:
      "If an account exists for that email, a password reset link has been sent.",
  };
}

export async function resetPasswordAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const ok = await resetPasswordWithToken(
    parsed.data.token,
    parsed.data.password,
  );

  if (!ok) return { error: "This reset link is invalid or has expired." };

  return {
    success: "Password changed. You can now sign in with the new password.",
  };
}

export async function requestVerificationAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = emailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: firstIssue(parsed.error) };

  if (await isRateLimited("verify-email", parsed.data.email, 3)) {
    return {
      success:
        "If the account exists and still needs verification, a new link has been sent.",
    };
  }

  await recordRateLimitAttempt(
    "verify-email",
    parsed.data.email,
    15 * 60 * 1000,
  );

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (user && !user.emailVerifiedAt) {
    try {
      await issueVerificationToken(user.id, user.email);
    } catch (error) {
      console.error("Could not resend verification email", error);
    }
  }

  return {
    success:
      "If the account exists and still needs verification, a new link has been sent.",
  };
}

export async function verifyEmailAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = formData.get("token");
  if (typeof token !== "string" || token.length < 20) {
    return { error: "This verification link is invalid or expired." };
  }

  const verified = await verifyEmailToken(token);
  if (!verified) {
    return { error: "This verification link is invalid or expired." };
  }

  return { success: "Your email is verified. You can sign in now." };
}

export async function changePasswordAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) return { error: firstIssue(parsed.error) };

  const valid = await verifyPassword(
    parsed.data.currentPassword,
    user.passwordHash,
  );

  if (!valid) return { error: "Current password is incorrect." };

  const passwordHash = await hashPassword(parsed.data.password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
  ]);

  await clearSessionCookie();
  redirect("/login?passwordChanged=1");
}
