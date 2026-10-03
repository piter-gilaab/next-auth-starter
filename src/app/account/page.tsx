import { ChangePasswordForm } from "@/components/auth-forms";
import { requireUser } from "@/lib/auth/session";

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <main>
      <section className="auth-card">
        <span className="eyebrow">Account settings</span>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <h3>Change password</h3>
        <p>Changing your password signs out every active session.</p>
        <ChangePasswordForm />
      </section>
    </main>
  );
}
