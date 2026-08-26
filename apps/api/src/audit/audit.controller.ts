import { Controller, ForbiddenException, Get } from "@nestjs/common";
import { PERMISSIONS } from "@axora/types";
import type { AuditLog } from "@axora/database";
import { AuditService } from "./audit.service";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentContext } from "../common/decorators/current-context.decorator";
import type { RequestContext } from "../common/types/request-context";

@Controller("audit")
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.AUDIT_VIEW)
  async list(@CurrentContext() context: RequestContext): Promise<AuditLog[]> {
    if (!context.activeOrganizationId) {
      throw new ForbiddenException("No active organization on this session");
    }
    return this.audit.listForOrganization(context.activeOrganizationId);
  }
}
