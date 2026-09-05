# AXORA ONE — Product Architecture

`AXORA ONE` is the working name (configurable, see `packages/types/src/branding.ts`)
for the platform this repository builds: an Enterprise Operating System for
construction, engineering and asset-heavy organizations, functionally
informed by the AXORA ERP3602 audit but visually and architecturally
independent (see `docs/DECISIONS.md` ADR-0002, ADR-0005).

## Style

Modular monolith, API-first, multi-tenant. Matches ERP3602's own
justification (Section 10 of `docs/ARCHITECTURE.md` in the reference
repo): a distributed architecture is deferred until a specific domain
proves it needs independent scaling, isolation, or deployment.

```text
Browser
  -> Next.js App Router (apps/web)
  -> /api/v1/* same-origin proxy (BFF boundary)
  -> NestJS API (apps/api)
  -> domain modules (auth, organizations, companies, rbac, audit, health, ...)
  -> Prisma ORM (packages/database)
  -> PostgreSQL
```

## Monorepo layout

```text
apps/
  web/        Next.js App Router — AXORA Spatial Enterprise shell
  api/        NestJS modular monolith API
packages/
  database/   Prisma schema, migrations, generated client, seed
  security/   password hashing (scrypt), session token generation
  types/      shared permission keys, DTOs, branding config
  design-system/  design tokens (color, type, spacing, radii, shadows, motion)
  ui/         reserved for shared React components once a second consumer exists (see packages/ui/README.md); Wave 1 app-shell components live in apps/web/components
docs/         architecture, decisions, data model, roadmap, reference audit
.github/workflows/  CI
```

`apps/worker` and `apps/desktop` are named in the mission brief's target
layout but are **not created in this session** — there is no background
job or native packaging work yet that would justify them; adding an empty
directory would be exactly the "template scaffolding no one uses" anti-
pattern the brief warns against. They are listed as Wave-13+ work in
`IMPLEMENTATION_ROADMAP.md`.

## Tenancy model

```text
User
  -> Membership (Organization)
     -> CompanyMembership (explicit company access)
     -> OrganizationRoleAssignment
     -> CompanyRoleAssignment
```

Identical shape to ERP3602's verified model (see audit). A `companyId`
supplied by the browser is never treated as authorization proof — every
protected request resolves a `RequestContext` from the authenticated
session's server-side state plus a fresh membership check.

## Authentication

Opaque server-side sessions (ADR-0004): scrypt-derived password hash,
32-byte random session token, only its SHA-256 hash persisted, HttpOnly
cookie, session row carries `activeOrganizationId` / `activeCompanyId`.
Login failures are throttled per credential-hash to slow brute force.

## Authorization

Deny-by-default. `Permission` is a flat table of typed keys
(`packages/types/src/permissions.ts` is the single source of truth, mirrored
into the database by a sync script — matching ERP3602's own approach of
typed shared permission constants). A request is permitted only if the
caller's validated membership holds the permission via an organization-role
assignment or a company-role assignment for the currently active company.

## Audit

`AuditLog` is append-only (no update/delete route exists; a database
trigger additionally rejects UPDATE/DELETE at the PostgreSQL level, mirroring
ERP3602's own database-level guard). Every row captures actor, org, company,
action, resourceType/resourceId, outcome, requestId, metadata, and network
context.

## Design system / App shell

See `docs/DESIGN_SYSTEM.md` and `docs/DESIGN_DIRECTION.md`. Four zones:
Navigation Rail (Zone 1) → Workspace Navigator (Zone 2, contextual) → Main
Canvas (Zone 3) → Intelligence Drawer (Zone 4, optional). Built from
scratch against the brief, not against ERP3602's dark command-center shell.

## API conventions

- Prefix `/api/v1`.
- JSON bodies, DTO validation via `class-validator`, unknown properties
  rejected.
- Every response carries a `x-request-id` correlation header; audit rows
  store the same id.
- `GET /api/v1/health` is unauthenticated and unaudited.
- All other routes require an authenticated session; tenant-scoped routes
  additionally require an active organization (and, where relevant,
  company) context resolved server-side.

## What is explicitly deferred

Everything under Sections 8–33 of the mission brief (CRM through AI
governance) beyond the Foundation slice — see `IMPLEMENTATION_ROADMAP.md`
for the wave sequencing. This document describes the Foundation
architecture that those future domains will be built on top of, not a
promise that they already exist.
