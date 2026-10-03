import { Role } from "@/generated/prisma/client";
import { requireRole } from "@/lib/auth/session";

export default async function AdminPage() {
  const user = await requireRole(Role.ADMIN);

  return (
    <main>
      <section className="card">
        <span className="eyebrow">Role protected</span>
        <h2>Admin area</h2>
        <p>
          Signed in as {user.email}. Replace this page with the administration features of the real project.
        </p>
      </section>
    </main>
  );
}
