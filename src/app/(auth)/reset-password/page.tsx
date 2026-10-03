import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth-forms";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";

  return (
    <main>
      <section className="auth-card">
        <span className="eyebrow">Recovery</span>
        <h2>Choose a new password</h2>
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="message error">Missing reset token.</p>
        )}
        <p className="auth-footer"><Link href="/login">Back to login</Link></p>
      </section>
    </main>
  );
}
