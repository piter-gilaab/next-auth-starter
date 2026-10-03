import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { logoutAction } from "./actions";
import "./globals.css";

export const metadata: Metadata = {
  title: "Next Auth Starter",
  description: "Reusable authentication starter for Next.js and PostgreSQL.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link href="/" className="brand">Auth Starter</Link>
          <nav className="nav" aria-label="Main navigation">
            {user ? (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/account">Account</Link>
                {user.role === "ADMIN" ? <Link href="/admin">Admin</Link> : null}
                <form action={logoutAction}>
                  <button className="link-button" type="submit">Logout</button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">Login</Link>
                <Link href="/register">Register</Link>
              </>
            )}
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
