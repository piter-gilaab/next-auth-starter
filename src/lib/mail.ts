import nodemailer from "nodemailer";

function appUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

async function sendMail(to: string, subject: string, text: string) {
  const host = process.env.SMTP_HOST;

  if (!host) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP_HOST must be configured in production.");
    }

    console.log(`\n[DEV EMAIL]\nTo: ${to}\nSubject: ${subject}\n${text}\n`);
    return;
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASSWORD
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "Auth Starter <no-reply@example.com>",
    to,
    subject,
    text,
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const link = `${appUrl()}/verify-email?token=${encodeURIComponent(token)}`;
  await sendMail(
    email,
    "Verify your email",
    `Open this link to verify your email address:\n\n${link}\n\nThis link expires in 24 hours.`,
  );
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const link = `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  await sendMail(
    email,
    "Reset your password",
    `Open this link to reset your password:\n\n${link}\n\nThis link expires in 30 minutes.`,
  );
}
