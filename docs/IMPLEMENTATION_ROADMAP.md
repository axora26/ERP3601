# Implementation Roadmap

Waves as specified by the mission brief, Section 62. Each wave must be
tested (real UI → API → DB → reload chain, per Section 77) before the next
begins. This session executes Wave 0 and Wave 1 only.

| Wave | Scope | This session |
|---|---|---|
| 0 | Audit ERP3602: functionality, architecture, tests, data model, UX, security | **Done** — `docs/reference/ERP3602_FUNCTIONAL_AUDIT.md` |
| 1 | Foundation: monorepo, database, auth, organization/company, RBAC, audit, design system, app shell | **Done** — this repository |
| 2 | Command Center + CRM | Not started |
| 3 | Commercial: studies, DQE, catalog, quotes, contracts | Not started |
| 4 | Projects + Cost Control | Not started |
| 5 | Procurement + Inventory + Logistics | Not started |
| 6 | Workforce + HR + Payroll | Not started |
| 7 | Finance | Not started |
| 8 | Engineering + BIM + GED | Not started |
| 9 | Quality + HSE + Commissioning | Not started |
| 10 | Assets + Maintenance | Not started |
| 11 | Smart Building + Energy + Access Control | Not started |
| 12 | Analytics + Automation + AI | Not started |
| 13 | PWA + Windows + mobile readiness | Not started |
| 14 | Hardening + performance + production qualification | Not started |

## Recommended next session's entry point

1. Start from this repository's `main` (post-merge of the Wave 1 PR).
2. Re-run `pnpm install && pnpm db:migrate:deploy && pnpm test` to confirm
   the Foundation slice still passes before adding anything.
3. Pick Wave 2 (Command Center + CRM) and follow the same discipline as
   Wave 1: real Prisma models with the tenant-scoping conventions in
   `docs/DATA_MODEL_PLAN.md`, a real NestJS module with RBAC + audit, a
   real Next.js workspace under the app shell, and an actual local
   verification pass (migrate → seed → start → hit the UI → hit the API →
   reload) before declaring anything `VERIFIED` in `docs/FUNCTIONAL_MATRIX.md`.
4. Do not skip straight to a later wave (e.g. Finance) without its
   upstream domains (Commercial/Projects) existing — the brief's Section 75
   transactional chains (CRM → Study → DQE → Quote → Contract → Project →
   ...) assume each link's source domain already exists.
