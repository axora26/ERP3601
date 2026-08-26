# RBAC

## Model

```text
User
  -> Membership (Organization)       [status: ACTIVE | SUSPENDED | INVITED]
     -> OrganizationRoleAssignment -> Role -> RolePermission -> Permission
     -> CompanyMembership (explicit, opt-in per company)
        -> CompanyRoleAssignment -> Role -> RolePermission -> Permission
```

A `Role` is organization-scoped (`Role.organizationId`) and can be
assigned either at the organization level (grants apply regardless of
active company) or at the company level (grants apply only while that
company is the session's active company). A permission check unions both
sources for the caller's current context.

## Permission keys

Single source of truth: `packages/types/src/permissions.ts`. The database
`Permission` table is synced from this list
(`packages/database/prisma/sync-permissions.ts`, also run inside
`prisma/seed.ts`) — code defines permissions, the database mirrors them,
never the reverse.

Wave 1 permissions:

| Key | Meaning |
|---|---|
| `organization:manage` | Create/update organization-level settings (not yet exposed by any route). |
| `organization:view` | Read organization details. |
| `company:manage` | Create/update companies (not yet exposed by any route). |
| `company:view` | List/read companies in the active organization. |
| `membership:manage` | Manage user memberships (not yet exposed by any route). |
| `role:manage` | Manage roles/permission assignments (not yet exposed by any route). |
| `audit:view` | Read the organization's audit log. |

Several keys exist ahead of their enforcing route because the schema/RBAC
substrate is designed to be additive — adding a route in a later wave
should never require a schema migration to also add the permission it
checks.

## Seeded roles (demo data only)

- `SYSTEM_ADMIN` — every permission, assigned at the organization level.
- `MEMBER` — `organization:view` only.

Real deployments should not treat these as anything other than a
starting point; role design for a specific organization is out of Wave 1
scope.

## Enforcement point

`PermissionsGuard` (`apps/api/src/common/guards/permissions.guard.ts`),
installed globally via `APP_GUARD` in `apps/api/src/app.module.ts`,
runs after `SessionGuard` on every request. A denial is itself an audited
event (`action: "authorization.denied"`, `outcome: "DENIED"`).

Frontend button/link visibility (e.g. hiding a nav item) is a UX
convenience only — it is never the actual authorization boundary, per
mission Section 44/74's "frontend guard is not a security control" rule.
