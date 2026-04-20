import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { VouchersRepository } from './vouchers.repository';

@Injectable()
export class VoucherService {
  constructor(private readonly repo: VouchersRepository) {}

  /**
   * Concurrency-safe usage claim (global + per-user).
   * This is intentionally not exposed as an API here; it’s designed for checkout integration later.
   */
  async claimUsage(params: {
    code: string;
    userId: string;
    orderTotal: number;
    discountAmount: number;
    orderId?: string | null;
    now?: Date;
  }) {
    const now = params.now ?? new Date();
    const code = params.code.trim().toUpperCase();

    return this.repo.$transaction(async (tx) => {
      const voucher = await (tx as any).voucher.findUnique({ where: { code } });
      if (!voucher) throw new NotFoundException('Voucher not found');
      if (!voucher.isActive) throw new BadRequestException('Voucher is inactive');
      if (voucher.startDate > now || voucher.endDate < now) throw new BadRequestException('Voucher is not in active time window');
      if (params.orderTotal < Number(voucher.minOrderValue)) throw new BadRequestException('Order does not meet minOrderValue');

      const usedByUser = await (tx as any).voucherUsage.count({
        where: { voucherId: voucher.id, userId: params.userId },
      });
      if (usedByUser >= voucher.usagePerUserLimit) throw new BadRequestException('Voucher usage per user limit exceeded');

      const updated = await (tx as any).$executeRaw`
        UPDATE "Voucher"
        SET "usedCount" = "usedCount" + 1
        WHERE "id" = ${voucher.id}::uuid
          AND "isActive" = true
          AND "startDate" <= ${now}::timestamptz
          AND "endDate" >= ${now}::timestamptz
          AND "usedCount" < "quantity"
      `;
      if (Number(updated) !== 1) {
        throw new BadRequestException('Voucher is out of stock');
      }

      const usage = await (tx as any).voucherUsage.create({
        data: {
          voucherId: voucher.id,
          userId: params.userId,
          orderId: params.orderId ?? null,
          discountAmount: params.discountAmount,
          usedAt: now,
        },
      });

      return { voucher, usage };
    });
  }
}

