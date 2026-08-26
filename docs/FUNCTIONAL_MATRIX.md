# Functional Matrix — AXORA ONE

Status vocabulary is the mission-mandated set: `PASS`, `PARTIAL`, `FAIL`,
`BLOCKED`, `NOT TESTED`, `NOT VERIFIED`. This matrix tracks the *new*
product, not ERP3602 (see `docs/reference/ERP3602_FUNCTIONAL_AUDIT.md` for
that). It will grow one wave at a time; only rows for work actually
attempted in this repository appear below.

| Domain | UI | API | DB | RBAC | Audit | Tests | Wave | Status |
|---|---|---|---|---|---|---|---|---|
| Repository / monorepo foundation | n/a | n/a | n/a | n/a | n/a | install + build | 1 | See Wave 1 report in the PR description |
| Organizations | switcher | `organizations` module | `Organization` model | org-scope guard | context-change audited | integration | 1 | See Wave 1 report |
| Companies | switcher | `companies` module | `Company` model | company-scope guard | context-change audited | integration | 1 | See Wave 1 report |
| Users / Authentication | login page | `auth` module | `User`, `Session`, `LoginThrottle` | n/a | login/logout audited | integration | 1 | See Wave 1 report |
| RBAC | n/a (server-enforced) | guard + decorator | `Role`, `Permission`, `RolePermission`, assignment tables | is the subject | denials audited | integration | 1 | See Wave 1 report |
| Audit trail | activity list (minimal) | `audit` module | `AuditLog`, DB-level append-only trigger | n/a | is the subject | integration | 1 | See Wave 1 report |
| Design system | tokens consumed by shell | n/a | n/a | n/a | n/a | visual read via running app | 1 | See Wave 1 report |
| App shell | nav rail, workspace navigator, canvas, drawer | n/a | n/a | n/a | n/a | manual desktop/mobile check | 1 | See Wave 1 report |
| CRM | not started | not started | not started | not started | not started | not started | 2 | NOT VERIFIED (not yet built) |
| Commercial (Study/DQE/Catalog/Quote) | not started | not started | not started | not started | not started | not started | 3 | NOT VERIFIED |
| Projects + Cost Control | not started | not started | not started | not started | not started | not started | 4 | NOT VERIFIED |
| Procurement / Inventory / Logistics | not started | not started | not started | not started | not started | not started | 5 | NOT VERIFIED |
| Workforce / HR / Payroll | not started | not started | not started | not started | not started | not started | 6 | NOT VERIFIED |
| Finance | not started | not started | not started | not started | not started | not started | 7 | NOT VERIFIED |
| Engineering / BIM / GED | not started | not started | not started | not started | not started | not started | 8 | NOT VERIFIED |
| Quality / HSE / Commissioning | not started | not started | not started | not started | not started | not started | 9 | NOT VERIFIED |
| Assets / Maintenance | not started | not started | not started | not started | not started | not started | 10 | NOT VERIFIED |
| Smart Building / Energy / Access Control | not started | not started | not started | not started | not started | not started | 11 | NOT VERIFIED |
| Analytics / Automation / AI | not started | not started | not started | not started | not started | not started | 12 | NOT VERIFIED |
| PWA / Windows / mobile | not started | not started | not started | not started | not started | not started | 13 | NOT VERIFIED |
| Hardening / performance / production qualification | not started | not started | not started | not started | not started | not started | 14 | NOT VERIFIED |

The "See Wave 1 report" cells point to this session's final report message
(Section 70 format), which is the actual evidence (commands run, output
observed) — this table is an index, not a substitute for that evidence.
