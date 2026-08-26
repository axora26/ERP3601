# API

Prefix: `/api/v1`. JSON bodies. DTO validation via `class-validator`
(`ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })` —
unknown properties are rejected, not silently dropped). Every response
carries an `x-request-id` header; audit rows store the same id
(`RequestIdMiddleware`, `apps/api/src/common/middleware/request-id.middleware.ts`).

## Routes (Wave 1)

| Method | Path | Auth | Permission | Purpose |
|---|---|---|---|---|
| GET | `/health` | Public | — | Liveness + database reachability. |
| POST | `/auth/login` | Public | — | Email/password login, sets session cookie. |
| POST | `/auth/logout` | Session | — | Revokes the current session. |
| GET | `/auth/me` | Session | — | Current session's user/org/company context. |
| POST | `/auth/switch-context` | Session | — (membership is re-checked, not a permission) | Change active organization/company. |
| GET | `/organizations/active` | Session | `organization:view` | Active organization detail. |
| GET | `/companies` | Session | `company:view` | Companies in the active organization. |
| GET | `/audit` | Session | `audit:view` | Recent audit events for the active organization. |

## Error shape

```json
{ "requestId": "...", "code": "ForbiddenException", "message": "..." }
```

Produced by `HttpExceptionFilter` (`apps/api/src/common/filters/http-exception.filter.ts`)
for every thrown exception, not just validation errors.

## Conventions for future modules

- Every mutating route must declare `@RequirePermissions(...)`.
- Every tenant-scoped read/write must go through `CurrentContext()` for
  `activeOrganizationId`/`activeCompanyId` — never accept them as request
  parameters and trust them.
- Anything that changes state should call `AuditService.record(...)`.
