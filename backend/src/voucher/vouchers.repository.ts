import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class VouchersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByCode(code: string) {
    return this.prisma.voucher.findUnique({ where: { code } });
  }

  countUserUsage(voucherId: string, userId: string) {
    return this.prisma.voucherUsage.count({ where: { voucherId, userId } });
  }

  /**
   * Atomic increment guarded by global remaining + time window + isActive.
   * Returns number of rows updated (0 => cannot reserve).
   */
  async reserveOneUsage(voucherId: string, now: Date): Promise<number> {
    const updated = await this.prisma.$executeRaw`
      UPDATE "Voucher"
      SET "usedCount" = "usedCount" + 1
      WHERE "id" = ${voucherId}::uuid
        AND "isActive" = true
        AND "startDate" <= ${now}::timestamptz
        AND "endDate" >= ${now}::timestamptz
        AND "usedCount" < "quantity"
    `;
    return Number(updated);
  }

  createUsage(params: {
    voucherId: string;
    userId: string;
    orderId?: string | null;
    discountAmount: number;
    usedAt?: Date;
  }) {
    return this.prisma.voucherUsage.create({
      data: {
        voucherId: params.voucherId,
        userId: params.userId,
        orderId: params.orderId ?? null,
        discountAmount: params.discountAmount,
        usedAt: params.usedAt ?? new Date(),
      },
    });
  }

  $transaction<T>(fn: (tx: PrismaService) => Promise<T>) {
    return this.prisma.$transaction(async (tx) => fn(tx as any));
  }
}

