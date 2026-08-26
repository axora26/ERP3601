import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { hashSessionToken } from "@axora/security";
import { DatabaseService } from "../../database/database.service";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import type { RequestContext } from "../types/request-context";

/**
 * Resolves the caller's session strictly server-side: the cookie only
 * carries an opaque token; every claim in RequestContext (active org,
 * active company, membership) is re-derived from the database on every
 * request, never trusted from anything the client sent.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly db: DatabaseService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request & { context?: RequestContext }>();
    const cookieName = process.env.SESSION_COOKIE_NAME ?? "axora_session";
    const token = (request.cookies as Record<string, string> | undefined)?.[cookieName];
    if (!token) {
      throw new UnauthorizedException("No active session");
    }

    const tokenHash = hashSessionToken(token);
    const session = await this.db.client.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new UnauthorizedException("Session is invalid or expired");
    }

    let membershipId: string | null = null;
    let companyMembershipId: string | null = null;
    if (session.activeOrganizationId) {
      const membership = await this.db.client.membership.findUnique({
        where: {
          userId_organizationId: {
            userId: session.userId,
            organizationId: session.activeOrganizationId,
          },
        },
      });
      membershipId = membership?.id ?? null;

      if (membership && session.activeCompanyId) {
        const companyMembership = await this.db.client.companyMembership.findUnique({
          where: {
            membershipId_companyId: {
              membershipId: membership.id,
              companyId: session.activeCompanyId,
            },
          },
        });
        companyMembershipId = companyMembership?.id ?? null;
      }
    }

    request.context = {
      userId: session.user.id,
      email: session.user.email,
      displayName: session.user.displayName,
      sessionId: session.id,
      membershipId,
      activeOrganizationId: session.activeOrganizationId,
      activeCompanyId: session.activeCompanyId,
      companyMembershipId,
    };

    void this.db.client.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });

    return true;
  }
}
