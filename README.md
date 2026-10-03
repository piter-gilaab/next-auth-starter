# Next Auth Starter

Reusable authentication template for projects built with **Next.js 16, TypeScript, PostgreSQL and Prisma 7**.

The goal is simple: do not spend time or AI context rebuilding authentication for every product. Keep this repository as a stable base, create a new repository from it, and change only the domain-specific parts.

## Included

- Email/password registration
- Login and logout
- PostgreSQL-backed server sessions
- Opaque session cookies (`HttpOnly`, `SameSite=Lax`, `Secure` in production)
- Password hashing with Node.js `scrypt` and random per-password salts
- Brute-force protection for login attempts
- Protected routes (`requireUser`)
- Role-based route protection (`USER` / `ADMIN`)
- Password reset with short-lived, one-time tokens
- Optional email verification with short-lived, one-time tokens
- SMTP support via Nodemailer
- Development email fallback that prints links in the terminal
- Change-password flow that invalidates all sessions
- Docker Compose PostgreSQL for local development
- Prisma admin seed
- Unit tests for password hashing and validation
- GitHub Actions quality workflow
- Security response headers

## Stack

- Next.js 16 / App Router
- React 19
- TypeScript
- PostgreSQL
- Prisma ORM 7
- Zod
- Nodemailer
- Vitest

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create the environment file

```bash
cp .env.example .env
```

Change secrets and production values before deploying.

### 3. Generate the Prisma Client

```bash
npm run prisma:generate
```

### 4. Start PostgreSQL

```bash
docker compose up -d
```

Or point `DATABASE_URL` at any PostgreSQL-compatible database you control.

### 5. Create the database schema

```bash
npm run db:migrate
```

### 6. Optional: create/update the admin user

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD` and optionally `ADMIN_NAME` in `.env`, then run:

```bash
npm run db:seed
```

### 7. Start the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Email behavior

By default:

```env
AUTH_REQUIRE_EMAIL_VERIFICATION="false"
```

Registration immediately creates a session.

To require email verification:

```env
AUTH_REQUIRE_EMAIL_VERIFICATION="true"
```

In development, when `SMTP_HOST` is empty, verification and password-reset links are printed to the terminal.

In production, configure SMTP. The mail layer intentionally uses generic SMTP so this starter is not tied to a specific vendor.

## Reusing this starter in a new project

Recommended workflow:

1. Push this repository to GitHub.
2. In GitHub repository settings, enable **Template repository**.
3. For a new product, choose **Use this template** instead of starting from zero.
4. Rename the application and update metadata/branding.
5. Add the product's domain models to `prisma/schema.prisma` without removing the auth models.
6. Keep `src/lib/auth/*` as the authentication boundary.
7. Replace `/dashboard` and `/admin` with the new application's real features.
8. Add new roles/permissions only when the new product actually needs them.

This is usually better than copying random auth files between repositories because the base remains versioned and testable.

## Important files

```text
src/
├── app/
│   ├── (auth)/                 # Login, registration and recovery pages
│   ├── account/                # Authenticated account settings
│   ├── admin/                  # Example ADMIN-only route
│   ├── dashboard/              # Example authenticated route
│   └── actions.ts              # Server-side auth mutations
├── components/
│   └── auth-forms.tsx          # Client forms
└── lib/
    ├── auth/
    │   ├── email-verification.ts
    │   ├── password-reset.ts
    │   ├── password.ts
    │   ├── rate-limit.ts
    │   ├── session.ts
    │   ├── tokens.ts
    │   └── validation.ts
    ├── mail.ts
    └── prisma.ts

prisma/
├── schema.prisma
└── seed.ts
```

## Security model

### Passwords

Passwords are never stored directly. `scrypt` derives a password hash using a cryptographically random salt. Password inputs are limited to 128 characters to keep computational cost bounded.

### Sessions

The browser receives a random opaque token. PostgreSQL stores only a SHA-256 hash of that token. Stealing the session table alone therefore does not directly reveal usable browser session tokens.

### Password reset / email verification

Reset and verification links use random one-time tokens. Only token hashes are stored. Reset links expire after 30 minutes; verification links expire after 24 hours.

### Login throttling

Login failures, password-reset requests and verification-email resends use PostgreSQL-backed rate limits keyed by a hash of client IP + normalized email. This works across multiple Next.js instances without relying on process memory. On self-hosted deployments, make sure your reverse proxy overwrites forwarding headers rather than trusting client-supplied values.

### Authorization

`requireUser()` protects authenticated server-rendered pages. `requireRole(Role.ADMIN)` demonstrates role authorization. Do not rely only on hiding buttons in the UI—enforce permissions in server code around the actual data/action as well.

## Production checklist

Before using this for a real customer:

- Set a production `DATABASE_URL`.
- Configure `APP_URL` with HTTPS.
- Configure a real SMTP provider.
- Set `AUTH_REQUIRE_EMAIL_VERIFICATION=true` when appropriate.
- Replace the example admin credentials.
- Keep `.env` out of Git.
- Run `npm run typecheck`, `npm run lint`, and `npm test`.
- Run Prisma migrations in deployment using `npm run db:deploy`.
- Add backups and monitoring for PostgreSQL.
- Review role/permission requirements for the specific product.
- Add MFA / SSO when the customer or risk profile requires it.
- Add audit logging for security-sensitive actions when needed.
- Review privacy/data-retention requirements for the jurisdiction and customer.

## What this intentionally does not include

A reusable starter should not pretend that every application has the same authorization requirements. The following are intentionally product-specific:

- OAuth/social login
- Enterprise SSO/SAML
- MFA/passkeys
- Organization/tenant membership
- Fine-grained RBAC/ABAC
- Audit-log retention policies
- Customer-specific legal consent screens

Add these as separate reusable modules when you start seeing the same requirement across several projects.

## Useful commands

```bash
npm run dev
npm run build
npm run typecheck
npm run lint
npm test
npm run db:migrate -- --name your_migration
npm run db:deploy
npm run db:studio
npm run db:seed
```

## License

MIT. Use it as a starting point for your own projects.
