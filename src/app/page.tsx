import Link from "next/link";

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <span className="eyebrow">Reusable project template</span>
        <h1>Authentication you can reuse instead of rebuilding.</h1>
        <p>
          A production-oriented starter with registration, login, database-backed
          sessions, password reset, optional email verification, roles and protected routes.
        </p>
        <div className="actions">
          <Link className="button" href="/register">Create account</Link>
          <Link className="button secondary" href="/login">Sign in</Link>
        </div>
      </section>

      <section className="grid">
        <article className="card">
          <strong>Secure credentials</strong>
          <p>Passwords use Node.js scrypt with per-password random salts.</p>
        </article>
        <article className="card">
          <strong>Server-side sessions</strong>
          <p>Only opaque session tokens reach the browser; only token hashes are stored in PostgreSQL.</p>
        </article>
        <article className="card">
          <strong>Ready to adapt</strong>
          <p>Keep the auth layer and replace branding, domain models and authorization rules per project.</p>
        </article>
      </section>
    </main>
  );
}
