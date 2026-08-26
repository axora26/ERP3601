import { Controller, Get, NotFoundException } from "@nestjs/common";
import { PERMISSIONS } from "@axora/types";
import { DatabaseService } from "../database/database.service";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentContext } from "../common/decorators/current-context.decorator";
import type { RequestContext } from "../common/types/request-context";

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly db: DatabaseService) {}

  @Get("active")
  @RequirePermissions(PERMISSIONS.ORGANIZATION_VIEW)
  async getActive(@CurrentContext() context: RequestContext) {
    if (!context.activeOrganizationId) {
      throw new NotFoundException("No active organization on this session");
    }
    const organization = await this.db.client.organization.findUnique({
      where: { id: context.activeOrganizationId },
      include: { companies: { where: { isActive: true } } },
    });
    if (!organization) {
      throw new NotFoundException("Active organization not found");
    }
    return organization;
  }
}
