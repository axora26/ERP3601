# AXORA ONE

`AXORA ONE` (working name, configurable — see `packages/types/src/branding.ts`)
is an enterprise operating system for construction, engineering and
asset-heavy organizations. This repository is functionally informed by an
audit of AXORA ERP3602 (see `docs/reference/ERP3602_FUNCTIONAL_AUDIT.md`)
but is an independently authored codebase and design system — see
`docs/DECISIONS.md`.

**Current state: Wave 1 (Foundation) only.** Organizations, companies,
authentication, RBAC, audit trail, design system and the app shell are
real and locally verified. Every other business domain (CRM, Commercial,
Projects, Finance, ...) is intentionally not built yet — see
`docs/IMPLEMENTATION_ROADMAP.md` and `docs/FUNCTIONAL_MATRIX.md`.

## Runtime baseline

- Node.js 20.9+ (developed/verified on 22.22.2 — see `docs/DECISIONS.md` ADR-0001)
- pnpm 10.x
- Next.js 16, React 19
- NestJS 11
- Prisma ORM 7
- PostgreSQL 16+

## Repository layout

```text
apps/
  api/        NestJS modular monolith API
  web/        Next.js App Router frontend (AXORA Spatial Enterprise shell)
packages/
  database/   Prisma schema, migrations, generated client, seed
  security/   password hashing (scrypt), session token generation
  types/      shared permission keys, DTOs, branding config
  design-system/  design tokens
  ui/         reserved for shared components once a second app consumes them
docs/         architecture, decisions, data model, roadmap, ERP3602 audit
```

## Local development

```bash
corepack enable
corepack prepare pnpm@10.33.0 --activate
cp .env.example .env
pnpm install
pnpm db:generate
pnpm db:migrate:dev
pnpm db:seed
pnpm dev
```

Web: `http://localhost:3000` — Login with `owner@demo.axora.test` /
`DemoPassword!123` (or `admin@demo.axora.test`, `member@demo.axora.test`,
same password — see `packages/database/prisma/seed.ts` for the full demo
roster and what each account can see).

API health: `http://localhost:4000/api/v1/health`

## Docker

```bash
docker compose up --build
```

**Not exercised in this session** — the sandbox this repository was
initially built in had no Docker daemon; verification instead ran the
API/web/Postgres stack directly against a local PostgreSQL 16 install (see
the Wave 1 report in the pull request for exact commands and output). The
compose file should be smoke-tested for real before being relied on.

## Security baseline

- Deny-by-default authorization.
- Server-side tenant/company scope checks; a `companyId` from the browser
  is never treated as authorization proof.
- Opaque sessions: random 32-byte token, only its SHA-256 hash stored.
- Password derivation with Node.js `scrypt`, per-password random salt.
- HttpOnly, SameSite=Lax session cookie.
- Audited authentication and context-change events.
- Explicit DTO validation, unknown properties rejected.

See `docs/PRODUCT_ARCHITECTURE.md`, `docs/DECISIONS.md`, `docs/DATA_MODEL_PLAN.md`.
