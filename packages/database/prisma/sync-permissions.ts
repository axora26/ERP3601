import "dotenv/config";
import { ALL_PERMISSION_KEYS } from "@axora/types";
import { createPrismaClient } from "../src/index";

/**
 * Permission keys live in code (packages/types) as the source of truth;
 * this script mirrors them into the database so a Role can reference a
 * real Permission row. Idempotent — safe to run on every deploy.
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
  console.log(`Synced ${ALL_PERMISSION_KEYS.length} permissions.`);
  await prisma.$disconnect();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
