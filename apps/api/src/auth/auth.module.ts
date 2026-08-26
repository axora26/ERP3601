import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { AuditModule } from "../audit/audit.module";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

@Module({
  imports: [DatabaseModule, AuditModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
