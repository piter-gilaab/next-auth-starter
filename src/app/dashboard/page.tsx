import Link from "next/link";
import { requireUser } from "@/lib/auth/session";

export default async function DashboardPage() {
  const user = await requireUser();

  return (
    <main>
      <section className="card">
        <span className="eyebrow">Protected route</span>
        <h2>Welcome, {user.name}</h2>
        <p>This page can only be rendered for an authenticated session.</p>
        <div className="meta">
          <div><span>Email</span><strong>{user.email}</strong></div>
          <div><span>Role</span><strong>{user.role}</strong></div>
          <div><span>Email verified</span><strong>{user.emailVerifiedAt ? "Yes" : "No"}</strong></div>
        </div>
        <div className="actions">
          <Link className="button secondary" href="/account">Account settings</Link>
          {user.role === "ADMIN" ? <Link className="button secondary" href="/admin">Admin area</Link> : null}
        </div>
      </section>
    </main>
  );
}
