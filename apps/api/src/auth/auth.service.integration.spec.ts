import "reflect-metadata";
import { ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { DatabaseModule } from "../database/database.module";
import { DatabaseService } from "../database/database.service";
import { AuditModule } from "../audit/audit.module";
import { AuthService } from "./auth.service";

/**
 * Integration test: runs the real AuthService against the local
 * PostgreSQL database (DATABASE_URL), seeded by
 * `pnpm --filter @axora/database prisma:seed` before this runs. Exercises
 * the actual UI-facing flow end to end at the service layer: login,
 * wrong password, cross-organization context switch denial, session
 * revocation on logout.
 */
describe("AuthService (integration)", () => {
  let authService: AuthService;
  let db: DatabaseService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DatabaseModule, AuditModule],
      providers: [AuthService],
    }).compile();

    authService = moduleRef.get(AuthService);
    db = moduleRef.get(DatabaseService);
    await db.onModuleInit();
  });

  afterAll(async () => {
    await db.onModuleDestroy();
  });

  const requestMeta = { requestId: "test-request", ipAddress: "127.0.0.1", userAgent: "jest" };

  it("logs in the seeded demo owner and returns organization/company context", async () => {
    const result = await authService.login("owner@demo.axora.test", "DemoPassword!123", requestMeta);
    expect(result.token).toBeTruthy();
    expect(result.context.email).toBe("owner@demo.axora.test");
    expect(result.context.organizations.length).toBeGreaterThan(0);
    expect(result.context.organizations[0]?.companies.length).toBeGreaterThan(0);
    expect(result.context.activeOrganizationId).toBe(result.context.organizations[0]?.id);
  });

  it("rejects an incorrect password without revealing whether the account exists", async () => {
    await expect(authService.login("owner@demo.axora.test", "wrong-password", requestMeta)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("rejects login for an unknown email with the same error type", async () => {
    await expect(authService.login("nobody@demo.axora.test", "whatever123", requestMeta)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it("denies switching into an organization the user has no membership in", async () => {
    const { context } = await authService.login("member@demo.axora.test", "DemoPassword!123", requestMeta);
    const session = await db.client.session.findFirst({
      where: { userId: context.userId },
      orderBy: { createdAt: "desc" },
    });
    await expect(
      authService.switchContext(
        session!.id,
        context.userId,
        "00000000-0000-0000-0000-000000000000",
        null,
        { requestId: "test-request" },
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("revokes the session on logout so it can no longer resolve a context", async () => {
    const { context } = await authService.login("admin@demo.axora.test", "DemoPassword!123", requestMeta);
    const session = await db.client.session.findFirst({
      where: { userId: context.userId },
      orderBy: { createdAt: "desc" },
    });
    await authService.logout(session!.id, { requestId: "test-request", userId: context.userId });
    const revoked = await db.client.session.findUnique({ where: { id: session!.id } });
    expect(revoked?.revokedAt).not.toBeNull();
  });
});
