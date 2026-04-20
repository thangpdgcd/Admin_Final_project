import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    // Prisma will establish a connection lazily on first query.
    // We avoid failing app startup when Postgres isn't running yet (dev ergonomics).
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

