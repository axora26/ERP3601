import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

export * from "../generated/prisma/client";

let sharedClient: PrismaClient | undefined;

export function createPrismaClient(databaseUrl: string): PrismaClient {
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return new PrismaClient({ adapter });
}

/**
 * Convenience singleton for API bootstrap; tests and scripts that need an
 * isolated client should call createPrismaClient directly instead.
 */
export function getSharedPrismaClient(databaseUrl: string): PrismaClient {
  if (!sharedClient) {
    sharedClient = createPrismaClient(databaseUrl);
  }
  return sharedClient;
}
