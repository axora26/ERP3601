# Security

## Authentication

Opaque server-side sessions (ADR-0004 in `docs/DECISIONS.md`):

1. Password derivation uses Node's `scrypt` (N=16384, r=8, p=1) with a
   random 16-byte salt per password, serialized as `scrypt1$<salt>$<hash>`
   (`packages/security/src/password.ts`).
2. On login, a 32-byte random token is generated; only its SHA-256 hash is
   persisted (`Session.tokenHash`); the raw token is returned solely in an
   HttpOnly, SameSite=Lax cookie (`Secure` in production).
3. Failed logins are throttled per SHA-256(email) key: 5 failures blocks
   further attempts for 15 minutes (`AuthService.registerFailure`).
4. Logout revokes the session row (`revokedAt`); a revoked or expired
   session fails `SessionGuard` on the next request.

## Authorization

Deny-by-default: `PermissionsGuard` refuses any route decorated with
`@RequirePermissions(...)` unless the caller's active membership holds the
permission via an organization-level or active-company-level role
assignment (`apps/api/src/common/guards/permissions.guard.ts`). Routes
without the decorator are still gated by `SessionGuard` (must be
authenticated) but carry no further restriction — there is no implicit
"anyone with a session can do anything tenant-scoped" behavior once a
domain adds `@RequirePermissions` to its routes, which every future wave's
mutating routes must do.

## Tenant isolation

- Every protected request resolves `RequestContext` server-side from the
  session row plus a fresh database membership check
  (`SessionGuard.canActivate`) — nothing from the request body/headers is
  trusted as the active organization/company.
- Every tenant-scoped Prisma model uses composite foreign keys
  `(id, organizationId[, companyId])` so a cross-tenant reference is a
  database constraint violation (ADR-0003).

## Audit

`AuditService.record` is the only write path to `AuditLog`. There is no
update/delete method anywhere in the codebase for that table, and
`packages/database/prisma/migrations/*_audit_log_append_only/migration.sql`
additionally installs a PostgreSQL rule/trigger rejecting `UPDATE`/`DELETE`
on `"AuditLog"` regardless of the calling layer.

## Known gaps (Wave 1 scope)

- MFA is not implemented.
- No CSRF token is issued; the API relies on `SameSite=Lax` cookies plus
  a same-origin BFF proxy. A same-site cookie policy is a partial
  mitigation, not a substitute for a CSRF token if a future wave adds a
  cross-site integration surface — revisit before that happens.
- No rate limiting beyond the login-throttle table (no general API rate
  limiter yet).
- No dependency-vulnerability scan wired into CI yet.
- No secrets are committed; `.env.example` contains only placeholder/dev
  values, and `.env` is gitignored.
