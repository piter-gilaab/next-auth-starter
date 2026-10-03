import Link from "next/link";
import {
  ResendVerificationForm,
  VerifyEmailForm,
} from "@/components/auth-forms";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <main>
      <section className="auth-card">
        <span className="eyebrow">Email verification</span>
        <h2>Verify your email</h2>
        {token ? (
          <>
            <p>Confirm the email verification request below.</p>
            <VerifyEmailForm token={token} />
          </>
        ) : (
          <>
            <p>Enter your email to request a new verification link.</p>
            <ResendVerificationForm />
          </>
        )}
        <p className="auth-footer"><Link href="/login">Go to login</Link></p>
      </section>
    </main>
  );
}
