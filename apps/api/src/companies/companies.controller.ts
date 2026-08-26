import { Controller, Get } from "@nestjs/common";
import { PERMISSIONS } from "@axora/types";
import { DatabaseService } from "../database/database.service";
import { RequirePermissions } from "../common/decorators/require-permissions.decorator";
import { CurrentContext } from "../common/decorators/current-context.decorator";
import type { RequestContext } from "../common/types/request-context";

@Controller("companies")
export class CompaniesController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  @RequirePermissions(PERMISSIONS.COMPANY_VIEW)
  async listForActiveOrganization(@CurrentContext() context: RequestContext) {
    if (!context.activeOrganizationId) {
      return [];
    }
    return this.db.client.company.findMany({
      where: { organizationId: context.activeOrganizationId, isActive: true },
      orderBy: { code: "asc" },
    });
  }
}
