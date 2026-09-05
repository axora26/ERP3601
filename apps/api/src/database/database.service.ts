import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { createPrismaClient, type PrismaClient } from "@axora/database";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  readonly client: PrismaClient;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required");
    }
    this.client = createPrismaClient(databaseUrl);
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
