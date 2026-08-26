# AXORA ERP3602 — Functional Audit (Wave 0)

## Method and evidence boundary

This audit is based on a shallow clone of `axora26/axora-erp3602` at commit
`7d19e216f660087b474588763cb722296ef37084` (the SHA named in the mission
brief; confirmed as the repository's current `HEAD` at audit time).

Evidence sources actually inspected in this session:

- `docs/MODULE_STATUS.md` — the repository's own domain-by-domain status
  ledger, which cites specific GitHub Actions run IDs and commit SHAs per
  domain.
- `docs/WEB_SURFACE_COVERAGE.md` — the repository's own mapping of modules
  to web routes / headless classifications.
- `docs/ARCHITECTURE.md`, `README.md` — stated architecture and security
  baseline.
- `packages/database/prisma/schema.prisma` and `packages/database/prisma/models/*.prisma`
  — the actual Prisma schema (read directly, not summarized from docs).
- `apps/api/src/*` and `apps/web/app/*` directory listings — actual module
  and route presence.
- `package.json` / `pnpm-workspace.yaml` — actual toolchain and scripts.

**What this audit does NOT include:** this session did not install
dependencies, run migrations, or execute ERP3602's own CI/test suite
against a live database. Per the mission brief's own rule ("a test present
in the repo does not mean it passes"), the `VERIFIED` statuses below are
**ERP3602's own self-reported, CI-gated claims** (each cites a specific
GitHub Actions run ID and commit SHA in `MODULE_STATUS.md`), not
independently re-executed by this audit. They are treated as credible
because they are falsifiable (specific run IDs, specific SHAs) rather than
generic claims, but re-verification was `NOT PERFORMED` in this session.

## Toolchain baseline (as declared by ERP3602)

| Layer | ERP3602 | Notes |
|---|---|---|
| Runtime | Node.js 24 LTS | This session's sandbox runs Node 22.22.2 — see ADR-0001. |
| Package manager | pnpm 11 | Sandbox has pnpm 10.33 — see ADR-0001. |
| Web | Next.js 16 / React 19 | |
| API | NestJS 11 | |
| ORM | Prisma ORM 7 | |
| Database | PostgreSQL 18 | Sandbox provides PostgreSQL 16 — functionally compatible for the Foundation slice; see ADR-0001. |
| Styling | Tailwind CSS 4 | |

## Domain matrix

Status column uses the mission-mandated vocabulary. `VERIFIED (self-reported)`
means ERP3602's own ledger cites a specific passing CI run for that slice;
this audit did not re-run that CI.

| Domain | UI | API | DB | RBAC | Audit | Tests | Status |
|---|---|---|---|---|---|---|---|
| Repository / tooling foundation | n/a | n/a | n/a | n/a | n/a | pnpm workspace, dependency allowlist, CI pipeline present | VERIFIED (self-reported) |
| Organization / Company / Branch | headless (admin API) | `core`, `identity` modules present | `Organization`, `Company`, `Branch` models present | present | present | cited | VERIFIED (self-reported) |
| Users / Authentication | login/logout flows | `auth` module present | `User`, `Session`, `LoginThrottle` models present | n/a | login/logout audited | cited | VERIFIED (self-reported) |
| RBAC | n/a (server-enforced) | guard present in `common/guards` | `Role`, `Permission`, `RolePermission`, `OrganizationRoleAssignment`, `CompanyRoleAssignment` models present | is the subject | present | cited | VERIFIED (self-reported) |
| Tenant isolation | n/a | composite FK pattern `(id, organizationId[, companyId])` used throughout schema | enforced via composite unique/FK constraints, not app-layer filters alone | n/a | n/a | cited | VERIFIED (self-reported) |
| Audit trail | n/a | `audit` module present | `AuditLog` model present, append-only per docs | n/a | is the subject | cited | VERIFIED (self-reported) |
| Core UI shell | `/`, command-center shell | n/a | n/a | n/a | n/a | cited (browser/a11y run) | VERIFIED (self-reported) |
| CRM | `/crm` | `crm` module present | `CrmAccount/Contact/Lead/Opportunity/Activity` present | present | present | cited | VERIFIED (self-reported) |
| Commercial / Study | headless-ish, feeds DQE | `commercial` module present | `study.prisma` models present | present | present | cited | VERIFIED (self-reported) |
| Commercial / DQE | `/commercial/dqe` | present | `DqeDocument`, `DqeLine`, `dqe-price-source.prisma`, `dqe-study-source.prisma` present | present | present | cited | VERIFIED (self-reported) |
| Commercial / Pricing (supplier price evidence) | `/catalog` | present | `pricing.prisma` present | present | present | cited | VERIFIED (self-reported) |
| Product Catalog | `/catalog` | `catalog` module present | `product.prisma` present | present | present | cited | VERIFIED (self-reported) |
| Commercial / Quote | `/commercial/quotes` | present | `QuoteDocument`, `QuoteRevision`, `QuoteLine` present | present | present | cited | VERIFIED (self-reported) |
| Contract | `/commercial/contracts`, `/commercial/contracts/variations` | `contract.prisma`, `project-contract.prisma` present | present | present | present | cited | VERIFIED (self-reported) |
| Procurement | `/procurement` | `procurement` module present | `Supplier`, `PurchaseRequest(Line)`, `PurchaseOrder(Line)`, `GoodsReceipt(Line)` present | present | present | cited | VERIFIED (self-reported) |
| Inventory | `/inventory` | `inventory` module present | `InventoryItem`, `Warehouse`, `StockLocation`, `StockBalance`, `StockMovement`, `StockTransfer`, `StockAdjustment` present | present | present | cited | VERIFIED (self-reported) |
| Logistics | `/logistics` | `logistics` module present | `logistics.prisma` present | present | present | not itemized separately | PARTIAL — present but not called out with its own CI run in `MODULE_STATUS.md` |
| Projects / WBS | `/operations`, `/outputs/project-cost-control` | `projects` module present | `Project`, `ProjectWbsItem`, `ProjectCommitment` present | present | present | cited | VERIFIED (self-reported) |
| Project Cost Control | `/operations/cost-control/{baselines,forecasts,mobilization,reserves,scenarios}` | headless service per coverage doc | commitment/cost models present; no dedicated "CostControl" domain file found by name | present | present | not itemized separately as its own gate | PARTIAL — web surface and DB substrate exist; classified `HEADLESS_SERVICE` by ERP3602 itself, no standalone verified-gate citation found |
| Site operations | `/operations` | `site` module present | `SiteZone`, `SiteDailyLog`, `SiteProgressEntry`, `SiteIssue`, `SiteEvidence` present | present | present | cited | VERIFIED (self-reported) |
| Finance (AR/AP) | `/finance`, `/finance/billing`, `/finance/payables`, `/outputs/invoices` | `finance` module present | `FinanceInvoice(Line)`, `FinancePayment`, `payables.prisma` present | present | present | cited | VERIFIED (self-reported) |
| HR / Workforce | `/hr`, `/workforce` | `hr`, `workforce` modules present | `HrDepartment/Position/Employee/Timesheet(Entry)` present | present | present | cited | VERIFIED (self-reported) |
| Payroll | `/payroll`, `/outputs/payslips` | `payroll` module present | not confirmed by direct schema read in this audit | present (implied) | present (implied) | referenced via Access Control gate, not its own row | PARTIAL — web/API/module presence confirmed; own CI-gate citation not found in `MODULE_STATUS.md` |
| Engineering / MEP | `/engineering` | `engineering` module present | `engineering.prisma` present | present | present | cited | VERIFIED (self-reported) |
| BIM | `/engineering` (shared surface) | `bim` module present | `BimModel`, `BimModelVersion`, `BimElement`, `Equipment`, `EquipmentBimBinding` present | present | present | cited | VERIFIED (self-reported) |
| GED / Documents | `/documents` | `documents` module present | `documents.prisma` present | present | present | cited | VERIFIED (self-reported) |
| QHSE | `/quality` | `qhse` module present | `qhse.prisma` present | present | present | cited | VERIFIED (self-reported) |
| Commissioning | `/quality` (shared surface) | `commissioning` module present | `commissioning.prisma` present | present | present | cited | VERIFIED (self-reported) |
| Assets / GMAO | `/assets` | `assets` module present | `assets.prisma`, `asset-document-evidence.prisma`, `maintenance-*.prisma` present | present | present | cited | VERIFIED (self-reported) |
| Automation (AXORA Flow) | `/analytics` (shared surface) | `automation` module present | `automation.prisma` present | present | present | cited | VERIFIED (self-reported) |
| AI / Inference evidence | `/ai-evidence` | `ai` module present | `ai.prisma` present | present | present | cited | VERIFIED (self-reported); explicitly "records evidence only, does not call an external model" |
| Analytics | `/analytics` | `analytics` module present | `analytics.prisma` present | present | present | cited | VERIFIED (self-reported) |
| Smart Building / Energy / IoT | `/smart-building` | `smart-building` module present | `smart-building.prisma` present | present | present | cited | VERIFIED (self-reported) |
| Access Control | `/access-control` | `access-control` module present | `access-control.prisma` present | present | present | cited, but explicitly `IMPLEMENTED_NOT_VERIFIED` by ERP3602 itself | PARTIAL — CI/DB evidence passed; physical-controller hardware qualification explicitly NOT done per ERP3602's own doc |
| Client / Supplier portals | `/portal` | `portal` module present | `portal.prisma`, `portal-resource-grant.prisma` present | separate portal RBAC | present | cited | VERIFIED (self-reported); explicitly excludes business-resource exposure |
| AXORA Academy | `/academy` | `academy` module present | `academy.prisma` present | present | present | cited | VERIFIED (self-reported) |
| Governance | `/governance` | `governance` module present | `governance.prisma` present | present | present | not individually cited with a run ID | PARTIAL — present, no standalone CI citation found |
| Notifications | headless / in-app | `notifications` module present | `in-app-notification.prisma` present | n/a | n/a | not individually cited | PARTIAL |
| MFA | n/a (security layer) | referenced (`mfa.prisma`) | `mfa.prisma` model file present | n/a | n/a | not individually cited | NOT VERIFIED — file exists, no citation found confirming an enforced/tested flow |
| Desktop (Windows) | n/a | n/a | n/a | n/a | n/a | `desktop/windows` directory exists; `AXORA-ERP3602-PERMANENT.ps1` present | NOT VERIFIED — packaging/install smoke not evidenced in the docs read |
| IFC parsing (as opposed to BIM metadata) | n/a | no dedicated IFC parser module found | `BimModelType` enum includes `IFC`, but only stores model/version/element metadata, not a parsed geometry pipeline | n/a | n/a | none found | NOT VERIFIED — ERP3602 itself only claims metadata/evidence tracking, not IFC file parsing |

## Key architectural patterns worth carrying forward

1. **Composite tenant-scoped foreign keys.** Nearly every child model's FK
   is `(childId, organizationId, companyId) → (id, organizationId, companyId)`
   on the parent, not a bare `parentId`. This makes cross-tenant data
   corruption a database-constraint violation, not just an application bug.
   This is stronger than "filter by companyId in the query" and is worth
   adopting directly.
2. **Opaque server-side sessions**, not JWTs: random token, only its
   SHA-256 hash stored, HttpOnly cookie, active org/company stored
   server-side on the session row and changed only after a membership
   check. This directly satisfies the brief's "a companyId supplied by the
   browser is never proof of authorization" rule (Section 43/44).
   Confirmed by direct schema read (`Session.tokenHash`, `activeOrganizationId`,
   `activeCompanyId`).
3. **Append-only AuditLog** with no update/delete surface, indexed by
   `(organizationId, companyId, createdAt)`, `(actorUserId, createdAt)`, and
   `(action, createdAt)` — matches Section 45's required audit shape almost
   field-for-field.
4. **Deny-by-default RBAC** via `Permission` (flat key + description),
   `Role` (org-scoped), and two assignment tables — one for org-level roles,
   one for company-level roles — rather than one polymorphic table. This
   cleanly separates "can act at the organization level" from "can act
   within this specific company."
5. **Headless/API-only classification is explicit**, not accidental — see
   `WEB_SURFACE_COVERAGE.md`'s `HEADLESS_ADMIN` / `HEADLESS_PLATFORM` /
   `HEADLESS_SERVICE` classification. The new product's navigation should
   make the same distinction rather than inventing menu items for
   capabilities that are correctly API-only.
6. **Provenance chains as first-class immutable link tables**, not derived
   joins — e.g. `dqe-study-source.prisma`, `procurement-project-source.prisma`,
   `finance-commissioning-source.prisma`, `installation-stock-source.prisma`.
   This is exactly the "objects flow naturally between domains" idea the
   brief asks for in Section 75 (CRM → Study → DQE → Quote → Contract →
   Project → …), and it is implemented as append-only evidence links rather
   than mutable foreign keys — worth reusing as the general pattern for
   every domain-to-domain handoff in the new product.

## What this audit deliberately does not claim

- It does not claim ERP3602's CI actually passes today — only that its own
  ledger cites specific run IDs/SHAs as evidence, which this session did
  not re-execute.
- It does not claim feature completeness beyond the "implemented vertical
  slice" ERP3602's own `MODULE_STATUS.md` explicitly limits itself to
  (see that file's line 5).
- Rows marked `PARTIAL` or `NOT VERIFIED` above reflect gaps in what this
  audit could find cited as evidence in the docs actually read — they are
  not necessarily gaps in ERP3602 itself; a deeper audit would need to read
  the module source and tests directly, which was out of scope for Wave 0
  given the size of this mission.
