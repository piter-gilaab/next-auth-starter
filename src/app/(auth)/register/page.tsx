import Link from "next/link";
import { RegisterForm } from "@/components/auth-forms";

export default function RegisterPage() {
  return (
    <main>
      <section className="auth-card">
        <span className="eyebrow">Account</span>
        <h2>Create account</h2>
        <p>Use at least 12 characters for your password.</p>
        <RegisterForm />
        <p className="auth-footer">
          Already registered? <Link href="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}
