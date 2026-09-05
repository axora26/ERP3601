/**
 * Single source of truth for permission keys. The database `Permission`
 * table is synced from this list (see packages/database/prisma/sync-permissions.ts)
 * rather than the other way around, so a permission referenced in code
 * always exists in the DB and vice versa.
 */
export const PERMISSIONS = {
  ORGANIZATION_MANAGE: "organization:manage",
  ORGANIZATION_VIEW: "organization:view",
  COMPANY_MANAGE: "company:manage",
  COMPANY_VIEW: "company:view",
  MEMBERSHIP_MANAGE: "membership:manage",
  ROLE_MANAGE: "role:manage",
  AUDIT_VIEW: "audit:view",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSION_KEYS: PermissionKey[] = Object.values(PERMISSIONS);

export const SYSTEM_ROLES = {
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  MEMBER: "MEMBER",
} as const;

export type SystemRoleKey = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];
