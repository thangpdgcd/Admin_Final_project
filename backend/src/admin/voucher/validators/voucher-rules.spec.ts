import { BadRequestException } from '@nestjs/common';
import { VoucherTypeDto } from '../dto/voucher-type.enum';
import { assertVoucherConfigValid, normalizeVoucherCode } from './voucher-rules';

describe('voucher-rules', () => {
  test('normalizeVoucherCode trims and uppercases', () => {
    expect(normalizeVoucherCode('  ab-c_1  ')).toBe('AB-C_1');
  });

  test('rejects invalid date window', () => {
    expect(() =>
      assertVoucherConfigValid({
        type: VoucherTypeDto.FIXED,
        value: 10,
        maxDiscount: null,
        minOrderValue: 0,
        quantity: 10,
        usedCount: 0,
        usagePerUserLimit: 1,
        startDate: new Date('2026-01-02T00:00:00Z'),
        endDate: new Date('2026-01-01T00:00:00Z'),
      }),
    ).toThrow(BadRequestException);
  });

  test('rejects percent > 100', () => {
    expect(() =>
      assertVoucherConfigValid({
        type: VoucherTypeDto.PERCENT,
        value: 101,
        maxDiscount: 10,
        minOrderValue: 0,
        quantity: 10,
        usedCount: 0,
        usagePerUserLimit: 1,
        startDate: new Date('2026-01-01T00:00:00Z'),
        endDate: new Date('2026-02-01T00:00:00Z'),
      }),
    ).toThrow(BadRequestException);
  });

  test('rejects fixed with maxDiscount', () => {
    expect(() =>
      assertVoucherConfigValid({
        type: VoucherTypeDto.FIXED,
        value: 10,
        maxDiscount: 5,
        minOrderValue: 0,
        quantity: 10,
        usedCount: 0,
        usagePerUserLimit: 1,
        startDate: new Date('2026-01-01T00:00:00Z'),
        endDate: new Date('2026-02-01T00:00:00Z'),
      }),
    ).toThrow(BadRequestException);
  });

  test('rejects quantity < usedCount', () => {
    expect(() =>
      assertVoucherConfigValid({
        type: VoucherTypeDto.FIXED,
        value: 10,
        maxDiscount: null,
        minOrderValue: 0,
        quantity: 1,
        usedCount: 2,
        usagePerUserLimit: 1,
        startDate: new Date('2026-01-01T00:00:00Z'),
        endDate: new Date('2026-02-01T00:00:00Z'),
      }),
    ).toThrow(BadRequestException);
  });
});

