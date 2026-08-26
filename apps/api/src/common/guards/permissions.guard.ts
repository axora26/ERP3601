import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import type { PermissionKey } from "@axora/types";
import { DatabaseService } from "../../database/database.service";
import { AuditService } from "../../audit/audit.service";
import { PERMISSIONS_KEY } from "../decorators/require-permissions.decorator";
import type { RequestContext } from "../types/request-context";

/**
 * Deny-by-default: a route decorated with @RequirePermissions is refused
 * unless the caller's active membership holds the permission through an
 * organization-level role OR a company-level role for the active company.
 * No permission requirement on a route means SessionGuard alone protects
 * it (authenticated, but not further restricted) — there is no implicit
 * allow for undecorated tenant-scoped routes elsewhere in this codebase.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<PermissionKey[] | undefined>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { context?: RequestContext; requestId?: string }>();
    const requestContext = request.context;
    if (!requestContext?.membershipId) {
      throw new ForbiddenException("No active organization membership");
    }

    const grantedKeys = new Set<string>();

    const orgAssignments = await this.db.client.organizationRoleAssignment.findMany({
      where: { membershipId: requestContext.membershipId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    for (const assignment of orgAssignments) {
      for (const rp of assignment.role.permissions) {
        grantedKeys.add(rp.permission.key);
      }
    }

    if (requestContext.companyMembershipId) {
      const companyAssignments = await this.db.client.companyRoleAssignment.findMany({
        where: { membershipId: requestContext.membershipId, companyId: requestContext.activeCompanyId ?? undefined },
        include: { role: { include: { permissions: { include: { permission: true } } } } },
      });
      for (const assignment of companyAssignments) {
        for (const rp of assignment.role.permissions) {
          grantedKeys.add(rp.permission.key);
        }
      }
    }

    const missing = required.filter((key) => !grantedKeys.has(key));
    if (missing.length > 0) {
      await this.audit.record({
        actorUserId: requestContext.userId,
        organizationId: requestContext.activeOrganizationId,
        companyId: requestContext.activeCompanyId,
        action: "authorization.denied",
        resourceType: "Permission",
        resourceId: missing.join(","),
        outcome: "DENIED",
        requestId: request.requestId ?? "unknown",
      });
      throw new ForbiddenException(`Missing required permission(s): ${missing.join(", ")}`);
    }

    return true;
  }
}
