# Database

PostgreSQL is the system of record. Prisma ORM (`packages/database`)
defines the schema; the checked-in SQL migrations are the reviewable
deployment artifact (`packages/database/prisma/migrations`).

## Access pattern

`apps/api` never imports `@prisma/client` directly — it goes through
`DatabaseService` (`apps/api/src/database/database.service.ts`), which
wraps `@axora/database`'s `createPrismaClient`, itself using
`@prisma/adapter-pg` (a driver adapter over `pg`, per Prisma 7's
recommended connection model) rather than Prisma's bundled query engine
binary.

## Conventions

See `docs/DATA_MODEL_PLAN.md` for the full convention list (composite
tenant-scoped foreign keys, `Decimal` for money, explicit currency
columns, timestamptz, append-only tables). Every future wave's schema
additions should follow the same conventions rather than introducing a
new pattern per domain.

## Migrations

```bash
pnpm db:migrate:dev      # local development, generates + applies
pnpm db:migrate:deploy   # CI/production, applies only
pnpm db:generate         # regenerate the Prisma client after a schema change
pnpm db:seed             # demo data (packages/database/prisma/seed.ts)
```

Migration `..._audit_log_append_only` (applied immediately after the
baseline schema migration) installs a PostgreSQL rule rejecting
`UPDATE`/`DELETE` on `"AuditLog"`, so the append-only guarantee holds even
against a direct database connection, not only against the API.

## What is NOT yet in the schema

Every business-domain model (CRM, DQE, projects, procurement, inventory,
finance, BIM, ...) — see `docs/DATA_MODEL_PLAN.md`'s "explicitly out of
scope" section and `docs/IMPLEMENTATION_ROADMAP.md`.
