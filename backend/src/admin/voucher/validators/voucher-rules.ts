import { BadRequestException } from '@nestjs/common';
import { VoucherTypeDto } from '../dto/voucher-type.enum';

export function normalizeVoucherCode(code: string) {
  return code.trim().toUpperCase();
}

export type VoucherConfigForValidation = {
  type: VoucherTypeDto;
  value: number;
  maxDiscount?: number | null;
  minOrderValue: number;
  quantity: number;
  usedCount: number;
  usagePerUserLimit: number;
  startDate: Date;
  endDate: Date;
};

export function assertVoucherConfigValid(cfg: VoucherConfigForValidation) {
  if (!(cfg.startDate instanceof Date) || Number.isNaN(cfg.startDate.getTime())) {
    throw new BadRequestException('startDate is invalid');
  }
  if (!(cfg.endDate instanceof Date) || Number.isNaN(cfg.endDate.getTime())) {
    throw new BadRequestException('endDate is invalid');
  }
  if (cfg.startDate.getTime() >= cfg.endDate.getTime()) {
    throw new BadRequestException('startDate must be before endDate');
  }

  if (cfg.minOrderValue < 0) {
    throw new BadRequestException('minOrderValue must be >= 0');
  }
  if (!Number.isInteger(cfg.quantity) || cfg.quantity < 0) {
    throw new BadRequestException('quantity must be an integer >= 0');
  }
  if (!Number.isInteger(cfg.usedCount) || cfg.usedCount < 0) {
    throw new BadRequestException('usedCount must be an integer >= 0');
  }
  if (cfg.quantity < cfg.usedCount) {
    throw new BadRequestException('quantity cannot be less than usedCount');
  }
  if (!Number.isInteger(cfg.usagePerUserLimit) || cfg.usagePerUserLimit < 1) {
    throw new BadRequestException('usagePerUserLimit must be an integer >= 1');
  }

  if (cfg.type === VoucherTypeDto.PERCENT) {
    if (!(cfg.value > 0 && cfg.value <= 100)) {
      throw new BadRequestException('PERCENT value must be in (0, 100]');
    }
    if (cfg.maxDiscount != null && cfg.maxDiscount <= 0) {
      throw new BadRequestException('maxDiscount must be > 0');
    }
  }

  if (cfg.type === VoucherTypeDto.FIXED) {
    if (!(cfg.value > 0)) {
      throw new BadRequestException('FIXED value must be > 0');
    }
    if (cfg.maxDiscount != null) {
      throw new BadRequestException('maxDiscount must be null for FIXED vouchers');
    }
  }
}

