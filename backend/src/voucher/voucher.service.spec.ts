import { BadRequestException, NotFoundException } from '@nestjs/common';
import { VoucherService } from './voucher.service';
import { VouchersRepository } from './vouchers.repository';

describe('VoucherService.claimUsage', () => {
  function makeRepo(overrides?: Partial<any>): VouchersRepository {
    return {
      $transaction: async (fn: any) => fn(overrides?.tx ?? {}),
    } as any;
  }

  test('throws NotFound when voucher missing', async () => {
    const tx = {
      voucher: { findUnique: async () => null },
    };
    const service = new VoucherService(makeRepo({ tx }));
    await expect(
      service.claimUsage({
        code: 'TEST',
        userId: 'u1',
        orderTotal: 100,
        discountAmount: 10,
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  test('throws when per-user limit exceeded', async () => {
    const now = new Date('2026-01-10T00:00:00Z');
    const tx = {
      voucher: {
        findUnique: async () => ({
          id: 'v1',
          code: 'TEST',
          isActive: true,
          startDate: new Date('2026-01-01T00:00:00Z'),
          endDate: new Date('2026-02-01T00:00:00Z'),
          minOrderValue: 0,
          usagePerUserLimit: 1,
        }),
      },
      voucherUsage: { count: async () => 1 },
    };
    const service = new VoucherService(makeRepo({ tx }));
    await expect(
      service.claimUsage({
        code: 'test',
        userId: 'u1',
        orderTotal: 100,
        discountAmount: 10,
        now,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  test('throws when out of stock (atomic update returns 0)', async () => {
    const now = new Date('2026-01-10T00:00:00Z');
    const tx = {
      voucher: {
        findUnique: async () => ({
          id: 'v1',
          code: 'TEST',
          isActive: true,
          startDate: new Date('2026-01-01T00:00:00Z'),
          endDate: new Date('2026-02-01T00:00:00Z'),
          minOrderValue: 0,
          usagePerUserLimit: 2,
        }),
      },
      voucherUsage: { count: async () => 0 },
      $executeRaw: async () => 0,
    };
    const service = new VoucherService(makeRepo({ tx }));
    await expect(
      service.claimUsage({
        code: 'test',
        userId: 'u1',
        orderTotal: 100,
        discountAmount: 10,
        now,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

