import "dotenv/config";
import { hashPassword } from "@axora/security";
import { ALL_PERMISSION_KEYS, SYSTEM_ROLES } from "@axora/types";
import { createPrismaClient } from "../src/index";

/**
 * Demo seed data — clearly tagged DEMO, never mistakable for production
 * data (mission Section 49). Idempotent: re-running does not duplicate
 * rows because it upserts on natural keys (slug/email/code).
 */
async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  const prisma = createPrismaClient(databaseUrl);

  for (const key of ALL_PERMISSION_KEYS) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, description: key.replace(":", " — ") },
    });
  }
  const allPermissions = await prisma.permission.findMany();

  const organization = await prisma.organization.upsert({
    where: { slug: "axora-demo-group" },
    update: {},
    create: { name: "AXORA DEMO GROUP", slug: "axora-demo-group" },
  });

  const companyA = await prisma.company.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: "DEMO-CONSTRUCT" } },
    update: {},
    create: {
      organizationId: organization.id,
      code: "DEMO-CONSTRUCT",
      name: "AXORA DEMO Construction Co.",
    },
  });

  const companyB = await prisma.company.upsert({
    where: { organizationId_code: { organizationId: organization.id, code: "DEMO-ENGINEERING" } },
    update: {},
    create: {
      organizationId: organization.id,
      code: "DEMO-ENGINEERING",
      name: "AXORA DEMO Engineering Co.",
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { organizationId_key: { organizationId: organization.id, key: SYSTEM_ROLES.SYSTEM_ADMIN } },
    update: {},
    create: {
      organizationId: organization.id,
      key: SYSTEM_ROLES.SYSTEM_ADMIN,
      name: "System Administrator",
      description: "Full access across the organization.",
      isSystem: true,
    },
  });
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: permission.id },
    });
  }

  const memberRole = await prisma.role.upsert({
    where: { organizationId_key: { organizationId: organization.id, key: SYSTEM_ROLES.MEMBER } },
    update: {},
    create: {
      organizationId: organization.id,
      key: SYSTEM_ROLES.MEMBER,
      name: "Member",
      description: "Read-only access to organization and company context.",
      isSystem: true,
    },
  });
  const memberPermission = allPermissions.find((p) => p.key === "organization:view");
  if (memberPermission) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: memberRole.id, permissionId: memberPermission.id } },
      update: {},
      create: { roleId: memberRole.id, permissionId: memberPermission.id },
    });
  }

  const demoUsers = [
    { email: "owner@demo.axora.test", displayName: "Demo Owner", role: adminRole, companies: [companyA, companyB] },
    { email: "admin@demo.axora.test", displayName: "Demo Admin", role: adminRole, companies: [companyA] },
    { email: "member@demo.axora.test", displayName: "Demo Member", role: memberRole, companies: [companyA] },
  ];

  for (const demoUser of demoUsers) {
    const passwordHash = await hashPassword("DemoPassword!123");
    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {},
      create: { email: demoUser.email, displayName: demoUser.displayName, passwordHash },
    });

    const membership = await prisma.membership.upsert({
      where: { userId_organizationId: { userId: user.id, organizationId: organization.id } },
      update: {},
      create: { userId: user.id, organizationId: organization.id },
    });

    await prisma.organizationRoleAssignment.upsert({
      where: { membershipId_roleId: { membershipId: membership.id, roleId: demoUser.role.id } },
      update: {},
      create: { membershipId: membership.id, roleId: demoUser.role.id, organizationId: organization.id },
    });

    for (const company of demoUser.companies) {
      const companyMembership = await prisma.companyMembership.upsert({
        where: { membershipId_companyId: { membershipId: membership.id, companyId: company.id } },
        update: {},
        create: { membershipId: membership.id, companyId: company.id, organizationId: organization.id },
      });
      await prisma.companyRoleAssignment.upsert({
        where: {
          membershipId_companyId_roleId: {
            membershipId: membership.id,
            companyId: company.id,
            roleId: demoUser.role.id,
          },
        },
        update: {},
        create: {
          membershipId: membership.id,
          companyId: company.id,
          organizationId: organization.id,
          roleId: demoUser.role.id,
        },
      });
      void companyMembership;
    }
  }

  console.log("Seed complete: organization=%s companies=[%s, %s] users=%d", organization.slug, companyA.code, companyB.code, demoUsers.length);
  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
