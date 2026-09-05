import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { DatabaseModule } from "./database/database.module";
import { AuditModule } from "./audit/audit.module";
import { AuthModule } from "./auth/auth.module";
import { OrganizationsModule } from "./organizations/organizations.module";
import { CompaniesModule } from "./companies/companies.module";
import { HealthModule } from "./health/health.module";
import { SessionGuard } from "./common/guards/session.guard";
import { PermissionsGuard } from "./common/guards/permissions.guard";

@Module({
  imports: [DatabaseModule, AuditModule, AuthModule, OrganizationsModule, CompaniesModule, HealthModule],
  providers: [
    { provide: APP_GUARD, useClass: SessionGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
