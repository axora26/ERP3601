# Data Model Plan — Foundation

Scope: the Wave 1 Prisma schema (`packages/database/prisma/schema.prisma`).
Later waves append their own models following the same conventions; they
are not designed in detail here (see `IMPLEMENTATION_ROADMAP.md`).

## Conventions (apply to every future model)

- `id String @id @default(uuid()) @db.Uuid`.
- Every tenant-scoped model carries `organizationId` and, where it belongs
  to a company, `companyId`, both `@db.Uuid`.
- Composite FK pattern from every tenant-scoped child to its parent:
  `@@unique([id, organizationId, companyId])` on the parent,
  `fields: [childOrgFk, organizationId, companyId], references: [id, organizationId, companyId]`
  on the child relation — a cross-tenant reference is a database
  constraint violation, not just an application bug (ADR-0003).
- `createdAt DateTime @default(now()) @db.Timestamptz(3)`, and
  `updatedAt DateTime @updatedAt @db.Timestamptz(3)` on anything mutable.
- Money: `Decimal @db.Decimal(24, 6)`, never `Float`. Currency is always an
  explicit `@db.Char(3)` column next to the amount.
- Enums for closed status vocabularies; free-text `VarChar` with an
  explicit length for everything else — no unstructured `Json` for data
  that has a shape.
- Append-only tables (`AuditLog`) get no update/delete path in the ORM
  layer *and* a PostgreSQL rule/trigger that rejects `UPDATE`/`DELETE`
  regardless of the calling layer.

## Wave 1 models

| Model | Purpose |
|---|---|
| `User` | Person who can authenticate. Email unique, scrypt password hash, status. |
| `Organization` | Top-level tenant boundary. |
| `Company` | Belongs to exactly one `Organization`; unit of business-data scoping. |
| `Membership` | A `User`'s relationship to an `Organization`. |
| `CompanyMembership` | A `Membership`'s explicit, opt-in access to one `Company`. |
| `Permission` | Flat typed permission key + description; source of truth mirrored from `packages/types`. |
| `Role` | Organization-scoped named bundle of permissions. |
| `RolePermission` | Join table, `Role` ↔ `Permission`. |
| `OrganizationRoleAssignment` | `Membership` ↔ `Role`, grants at the organization level. |
| `CompanyRoleAssignment` | `CompanyMembership` ↔ `Role`, grants at the company level. |
| `Session` | Opaque session: token hash, active org/company, expiry, revocation, device metadata. |
| `LoginThrottle` | Per-credential-hash failure counter for brute-force slowdown. |
| `AuditLog` | Append-only security/business event log. |

## Explicitly out of scope for Wave 1

Every business-domain model named in Sections 8–33 of the mission brief
(CRM accounts, DQE lines, purchase orders, inventory, projects, invoices,
BIM models, etc.). Wave 1's schema is deliberately just enough to prove
out organizations, companies, authentication, RBAC and audit end-to-end —
adding business tables now, before a single domain is actually built,
would be exactly the "premature abstraction" the operating instructions
warn against.

## Seed data

`packages/database/prisma/seed.ts` creates data clearly tagged as demo:
one `Organization` (`AXORA DEMO GROUP`), two `Company` rows under it, a
`SYSTEM_ADMIN` role with every permission, a `MEMBER` role with a minimal
read-only permission set, and three demo users (`owner@demo.axora.test`,
`admin@demo.axora.test`, `member@demo.axora.test`) — never anything that
could be mistaken for production credentials.
