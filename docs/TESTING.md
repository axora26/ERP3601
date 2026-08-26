# Testing

Status vocabulary throughout this repository's docs is `PASS` / `PARTIAL`
/ `FAIL` / `BLOCKED` / `NOT TESTED` / `NOT VERIFIED` — never `DONE` or
`PRODUCTION READY` without the run that proves it (mission Section 69).

## What exists in Wave 1

| Layer | Location | What it proves |
|---|---|---|
| Unit | `packages/security/src/password.test.ts` | Password hashing correctness/uniqueness (Node's built-in test runner, no framework dependency). |
| Integration | `apps/api/src/auth/auth.service.integration.spec.ts` | Real login/logout/switch-context/session-revocation flows against a real PostgreSQL database (seeded demo users), not mocks. Run via Jest (`pnpm --filter @axora/api test`). |
| Manual browser verification | See the Wave 1 report in the pull request | Login → command center → context switch → audit log → logout, checked in a running browser at desktop and mobile widths per Section 66. |

## What does not exist yet

- No browser automation (Playwright/Cypress) is wired up. Manual
  verification steps and their observed output are recorded in the PR's
  Wave 1 report instead of being asserted by a script — a real gap, not a
  hidden one.
- No accessibility audit tooling (axe, Lighthouse CI) is wired up yet;
  the shell was built against Section 47's checklist (landmarks, labels,
  keyboard, focus, headings) by hand, not verified by a tool.
- No load/performance testing.
- No security-specific test suite beyond what the integration test
  incidentally covers (wrong password, cross-org context-switch denial).

## Running tests locally

```bash
pnpm db:migrate:dev   # requires a reachable PostgreSQL (DATABASE_URL)
pnpm db:seed
pnpm build:packages
pnpm --filter @axora/api test
node --test packages/security/src/password.test.ts   # or via ts-node, see package.json
```

## For the next wave

Before declaring any new domain `VERIFIED` in `docs/FUNCTIONAL_MATRIX.md`,
run the same UI → API → DB → reload chain Section 77 requires, and record
the actual command output, not a description of what should happen.
