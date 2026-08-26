import { createHash } from "node:crypto";
import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { generateSessionToken, verifyPassword } from "@axora/security";
import type { SessionContextDto } from "@axora/types";
import { DatabaseService } from "../database/database.service";
import { AuditService } from "../audit/audit.service";

const MAX_FAILURES_BEFORE_BLOCK = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000;
const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS ?? 12);

export interface LoginResult {
  token: string;
  context: SessionContextDto;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
  ) {}

  private throttleKey(email: string): string {
    return createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  }

  async login(
    email: string,
    password: string,
    requestMeta: { requestId: string; ipAddress?: string; userAgent?: string },
  ): Promise<LoginResult> {
    const keyHash = this.throttleKey(email);
    const throttle = await this.db.client.loginThrottle.findUnique({ where: { keyHash } });
    if (throttle?.blockedUntil && throttle.blockedUntil > new Date()) {
      throw new ForbiddenException("Too many failed login attempts. Try again later.");
    }

    const user = await this.db.client.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    const passwordOk = user ? await verifyPassword(password, user.passwordHash) : false;

    if (!user || !passwordOk || user.status !== "ACTIVE") {
      await this.registerFailure(keyHash);
      await this.audit.record({
        actorUserId: user?.id ?? null,
        organizationId: null,
        companyId: null,
        action: "auth.login",
        resourceType: "User",
        resourceId: user?.id ?? email,
        outcome: "FAILURE",
        requestId: requestMeta.requestId,
        ipAddress: requestMeta.ipAddress,
        userAgent: requestMeta.userAgent,
      });
      throw new UnauthorizedException("Invalid credentials");
    }

    if (throttle) {
      await this.db.client.loginThrottle.update({
        where: { keyHash },
        data: { failureCount: 0, blockedUntil: null },
      });
    }

    const membership = await this.db.client.membership.findFirst({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "asc" },
    });
    const firstCompanyMembership = membership
      ? await this.db.client.companyMembership.findFirst({ where: { membershipId: membership.id } })
      : null;

    const { token, tokenHash } = generateSessionToken();
    const session = await this.db.client.session.create({
      data: {
        userId: user.id,
        tokenHash,
        activeOrganizationId: membership?.organizationId ?? null,
        activeCompanyId: firstCompanyMembership?.companyId ?? null,
        expiresAt: new Date(Date.now() + SESSION_TTL_HOURS * 60 * 60 * 1000),
        userAgent: requestMeta.userAgent,
        ipAddress: requestMeta.ipAddress,
      },
    });

    await this.audit.record({
      actorUserId: user.id,
      organizationId: session.activeOrganizationId,
      companyId: session.activeCompanyId,
      action: "auth.login",
      resourceType: "User",
      resourceId: user.id,
      outcome: "SUCCESS",
      requestId: requestMeta.requestId,
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });

    return { token, context: await this.buildSessionContext(user.id, session.id) };
  }

  private async registerFailure(keyHash: string): Promise<void> {
    const existing = await this.db.client.loginThrottle.findUnique({ where: { keyHash } });
    const nextCount = (existing?.failureCount ?? 0) + 1;
    const blockedUntil = nextCount >= MAX_FAILURES_BEFORE_BLOCK ? new Date(Date.now() + BLOCK_DURATION_MS) : null;
    await this.db.client.loginThrottle.upsert({
      where: { keyHash },
      update: { failureCount: nextCount, blockedUntil },
      create: { keyHash, failureCount: nextCount, blockedUntil },
    });
  }

  async logout(sessionId: string, requestMeta: { requestId: string; userId: string }): Promise<void> {
    const session = await this.db.client.session.update({
      where: { id: sessionId },
      data: { revokedAt: new Date() },
    });
    await this.audit.record({
      actorUserId: requestMeta.userId,
      organizationId: session.activeOrganizationId,
      companyId: session.activeCompanyId,
      action: "auth.logout",
      resourceType: "Session",
      resourceId: sessionId,
      outcome: "SUCCESS",
      requestId: requestMeta.requestId,
    });
  }

  async switchContext(
    sessionId: string,
    userId: string,
    organizationId: string,
    companyId: string | null | undefined,
    requestMeta: { requestId: string },
  ): Promise<SessionContextDto> {
    const membership = await this.db.client.membership.findUnique({
      where: { userId_organizationId: { userId, organizationId } },
    });
    if (!membership || membership.status !== "ACTIVE") {
      // organizationId has not been verified to reference a real row here
      // (the caller could pass any UUID) — AuditLog.organizationId is a
      // foreign key, so an unverified id must never be written into it.
      // The attempted id is preserved in resourceId instead.
      await this.audit.record({
        actorUserId: userId,
        organizationId: null,
        companyId: null,
        action: "auth.switch_context",
        resourceType: "Organization",
        resourceId: organizationId,
        outcome: "DENIED",
        requestId: requestMeta.requestId,
      });
      throw new ForbiddenException("No membership in the requested organization");
    }

    let resolvedCompanyId: string | null = null;
    if (companyId) {
      const companyMembership = await this.db.client.companyMembership.findUnique({
        where: { membershipId_companyId: { membershipId: membership.id, companyId } },
      });
      if (!companyMembership) {
        // organizationId is verified (membership check above passed);
        // companyId is not — same reasoning as the organization branch.
        await this.audit.record({
          actorUserId: userId,
          organizationId,
          companyId: null,
          action: "auth.switch_context",
          resourceType: "Company",
          resourceId: companyId,
          outcome: "DENIED",
          requestId: requestMeta.requestId,
        });
        throw new ForbiddenException("No membership in the requested company");
      }
      resolvedCompanyId = companyId;
    }

    await this.db.client.session.update({
      where: { id: sessionId },
      data: { activeOrganizationId: organizationId, activeCompanyId: resolvedCompanyId },
    });

    await this.audit.record({
      actorUserId: userId,
      organizationId,
      companyId: resolvedCompanyId,
      action: "auth.switch_context",
      resourceType: "Session",
      resourceId: sessionId,
      outcome: "SUCCESS",
      requestId: requestMeta.requestId,
    });

    return this.buildSessionContext(userId, sessionId);
  }

  async buildSessionContext(userId: string, sessionId: string): Promise<SessionContextDto> {
    const [user, session, memberships] = await Promise.all([
      this.db.client.user.findUniqueOrThrow({ where: { id: userId } }),
      this.db.client.session.findUniqueOrThrow({ where: { id: sessionId } }),
      this.db.client.membership.findMany({
        where: { userId, status: "ACTIVE" },
        include: {
          organization: true,
          companies: { include: { company: true } },
        },
      }),
    ]);

    return {
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      activeOrganizationId: session.activeOrganizationId,
      activeCompanyId: session.activeCompanyId,
      organizations: memberships.map((membership) => ({
        id: membership.organization.id,
        name: membership.organization.name,
        slug: membership.organization.slug,
        companies: membership.companies.map((cm) => ({
          id: cm.company.id,
          code: cm.company.code,
          name: cm.company.name,
        })),
      })),
    };
  }
}
