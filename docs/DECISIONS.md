# Architecture Decision Records

## ADR-0001 — Toolchain versions vs. the ERP3602 baseline

**Status:** Accepted.

**Context:** ERP3602 targets Node.js 24 LTS, pnpm 11, PostgreSQL 18. The
execution sandbox for this session provides Node.js 22.22.2, pnpm 10.33.0,
and PostgreSQL 16.13, with no Docker daemon available.

**Decision:** Target Node.js `>=20 <23` and pnpm `10.x` for this session's
work, PostgreSQL 16+ as the minimum supported version. Docker Compose files
are still written (for real deployment use) but were not exercised in this
session — API/DB verification instead ran directly against a local
PostgreSQL 16 cluster.

**Consequence:** Nothing in the Foundation slice depends on a Node 24-only
or PostgreSQL 18-only feature. When this repository is later run in an
environment with Node 24 / PostgreSQL 18 / Docker available, `engines` and
`docker-compose.yml` should be bumped and re-verified; this is a
configuration change, not an architecture change.

## ADR-0002 — New repository, not a fork or copy of ERP3602

**Status:** Accepted.

**Context:** Section 64 of the mission brief requires the new product to
live in a separate repository from ERP3602, using ERP3602 only as a
functional/architectural reference.

**Decision:** `axora26/erp3601` (this repository) is the new product's
home. ERP3602 was cloned read-only to `/home/user/axora-erp3602` for audit
purposes only; nothing from it was copied wholesale — schema, module
boundaries and security patterns were re-derived and re-typed by hand into
this repository so the new schema/API are independently authored, not a
copy-paste fork.

## ADR-0003 — Composite tenant-scoped foreign keys, adopted from ERP3602

**Status:** Accepted.

**Context:** The audit (`docs/reference/ERP3602_FUNCTIONAL_AUDIT.md`)
identified ERP3602's pattern of `(childId, organizationId[, companyId]) →
(id, organizationId[, companyId])` composite foreign keys as a database-
enforced tenant-isolation mechanism, not just an application-level filter.

**Decision:** Adopt the same pattern for every tenant-scoped model in
`packages/database/prisma/schema.prisma`. A row that references a parent
in a different organization/company is a foreign-key violation, not a
silent bug reachable only through missed `WHERE` clauses.

## ADR-0004 — Opaque server-side sessions, not JWTs

**Status:** Accepted.

**Context:** Section 44's "deny by default" principle and Section 43's
"a companyId supplied by a browser is never proof of authorization" rule
both push toward server-held session state rather than a self-contained
bearer token whose claims the client could (even if not maliciously)
present stale.

**Decision:** Sessions are random 32-byte tokens; only their SHA-256 hash
is persisted; the raw token lives only in an HttpOnly, SameSite=Lax cookie;
active organization/company context is a column on the `Session` row,
mutated server-side only after a membership check. This mirrors ERP3602's
verified approach.

## ADR-0005 — Design system does not reuse ERP3602's app shell

**Status:** Accepted.

**Context:** Section 2 explicitly forbids visually copying ERP3602's shell,
menus, or layouts. Section 34–38 specify a new "AXORA Spatial Enterprise"
visual language: a compact navigation rail, a contextual workspace
navigator, a main canvas, and an optional intelligence drawer.

**Decision:** `packages/design-system` and the `AppShell`-family components
in `packages/ui` are authored from scratch against the brief's four-zone
shell, not against ERP3602's dark command-center layout. Brand tokens
(`#1E3A8A`, `#2563EB`, `#111827`, `#BFC3C9`, `#FFFFFF`; Montserrat +
Inter) are reused because they are the AXORA brand identity per Section 37,
not because the layout is copied.

## ADR-0006 — Scope of this session: Wave 0 + Wave 1 only

**Status:** Accepted.

**Context:** The mission brief describes a 30+ business-domain, multi-year
enterprise platform (Sections 6–33), explicitly organized into 14 waves
(Section 62), each meant to be tested before the next begins.

**Decision:** This session delivers Wave 0 (audit) and Wave 1 (Foundation:
monorepo, database, auth, organization/company, RBAC, audit, design
system, app shell) as real, locally-run, tested code — not stub screens.
Waves 2–14 (CRM through hardening) are out of scope for this session and
are sequenced in `docs/IMPLEMENTATION_ROADMAP.md`. This is a direct
application of Section 62's own instruction not to attempt all domains
simultaneously without qualification, and of Section 69's ban on claiming
`DONE`/`PRODUCTION READY` without proof.
