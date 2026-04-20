import { Injectable } from '@nestjs/common';
import { Prisma, Voucher, VoucherUsage } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminVoucherRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.VoucherCreateInput): Promise<Voucher> {
    return this.prisma.voucher.create({ data });
  }

  findById(id: string): Promise<Voucher | null> {
    return this.prisma.voucher.findUnique({ where: { id } });
  }

  findByCode(code: string): Promise<Voucher | null> {
    return this.prisma.voucher.findUnique({ where: { code } });
  }

  update(id: string, data: Prisma.VoucherUpdateInput): Promise<Voucher> {
    return this.prisma.voucher.update({ where: { id }, data });
  }

  delete(id: string): Promise<Voucher> {
    return this.prisma.voucher.delete({ where: { id } });
  }

  async list(params: {
    where: Prisma.VoucherWhereInput;
    skip: number;
    take: number;
    orderBy: Prisma.VoucherOrderByWithRelationInput;
  }): Promise<{ items: Voucher[]; total: number }> {
    const [items, total] = await this.prisma.$transaction([
      this.prisma.voucher.findMany({
        where: params.where,
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
      }),
      this.prisma.voucher.count({ where: params.where }),
    ]);
    return { items, total };
  }

  async lastUsedAtByVoucherIds(voucherIds: string[]): Promise<Map<string, Date>> {
    if (voucherIds.length === 0) return new Map();

    const rows = await this.prisma.voucherUsage.groupBy({
      by: ['voucherId'],
      where: { voucherId: { in: voucherIds } },
      _max: { usedAt: true },
    });

    const map = new Map<string, Date>();
    for (const r of rows) {
      if (r._max.usedAt) map.set(r.voucherId, r._max.usedAt);
    }
    return map;
  }
}

