import Link from "next/link";
import { LoginForm } from "@/components/auth-forms";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ passwordChanged?: string }>;
}) {
  const params = await searchParams;

  return (
    <main>
      <section className="auth-card">
        <span className="eyebrow">Account</span>
        <h2>Sign in</h2>
        {params.passwordChanged ? (
          <p className="message success">Password updated. Sign in again.</p>
        ) : null}
        <LoginForm />
        <p className="auth-footer">
          No account? <Link href="/register">Create one</Link>
        </p>
      </section>
    </main>
  );
}
