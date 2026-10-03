import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth-forms";

export default function ForgotPasswordPage() {
  return (
    <main>
      <section className="auth-card">
        <span className="eyebrow">Recovery</span>
        <h2>Reset password</h2>
        <p>We will send a short-lived reset link if the account exists.</p>
        <ForgotPasswordForm />
        <p className="auth-footer"><Link href="/login">Back to login</Link></p>
      </section>
    </main>
  );
}
