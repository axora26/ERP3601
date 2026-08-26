import { Controller, Get } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";
import { DatabaseService } from "../database/database.service";

@Controller("health")
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Public()
  @Get()
  async check() {
    let database: "up" | "down" = "down";
    try {
      await this.db.client.$queryRaw`SELECT 1`;
      database = "up";
    } catch {
      database = "down";
    }
    return { status: database === "up" ? "ok" : "degraded", database, timestamp: new Date().toISOString() };
  }
}
