import { Injectable } from "@nestjs/common";
import type { AuditLog, AuditOutcome, Prisma } from "@axora/database";
import { DatabaseService } from "../database/database.service";

export interface AuditEventInput {
  actorUserId: string | null;
  organizationId: string | null;
  companyId: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  outcome: AuditOutcome;
  requestId: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * The only write path to AuditLog. There is deliberately no update/delete
 * method here or anywhere else in the API — the append-only guarantee is
 * additionally enforced at the database level by a migration-installed
 * rule (see packages/database/prisma/migrations).
 */
@Injectable()
export class AuditService {
  constructor(private readonly db: DatabaseService) {}

  async record(event: AuditEventInput): Promise<void> {
    await this.db.client.auditLog.create({
      data: {
        actorUserId: event.actorUserId,
        organizationId: event.organizationId,
        companyId: event.companyId,
        action: event.action,
        resourceType: event.resourceType,
        resourceId: event.resourceId ?? null,
        outcome: event.outcome,
        requestId: event.requestId,
        metadata: event.metadata,
        ipAddress: event.ipAddress ?? null,
        userAgent: event.userAgent ?? null,
      },
    });
  }

  async listForOrganization(organizationId: string, limit = 50): Promise<AuditLog[]> {
    return this.db.client.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 200),
    });
  }
}
