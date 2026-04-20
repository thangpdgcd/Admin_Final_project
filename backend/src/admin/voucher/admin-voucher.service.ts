import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Voucher } from '@prisma/client';
import { AdminListVoucherQuery, VoucherStatusDto } from './dto/admin-list-voucher.query';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { VoucherTypeDto } from './dto/voucher-type.enum';
import { AdminVoucherRepository } from './admin-voucher.repository';
import { assertVoucherConfigValid, normalizeVoucherCode } from './validators/voucher-rules';

function computeStatus(v: Voucher, now = new Date()): VoucherStatusDto {
  const remaining = v.quantity - v.usedCount;
  if (remaining <= 0) return VoucherStatusDto.OUT_OF_STOCK;
  if (!v.isActive) return v.startDate > now ? VoucherStatusDto.UPCOMING : v.endDate < now ? VoucherStatusDto.EXPIRED : VoucherStatusDto.EXPIRED;
  if (v.startDate > now) return VoucherStatusDto.UPCOMING;
  if (v.endDate < now) return VoucherStatusDto.EXPIRED;
  return VoucherStatusDto.RUNNING;
}

@Injectable()
export class AdminVoucherService {
  constructor(private readonly repo: AdminVoucherRepository) {}

  async create(dto: CreateVoucherDto) {
    const code = normalizeVoucherCode(dto.code);
    const type = dto.type;

    const value = dto.value;
    const maxDiscount = dto.maxDiscount ?? null;
    const minOrderValue = dto.minOrderValue ?? 0;
    const quantity = dto.quantity;
    const usagePerUserLimit = dto.usagePerUserLimit ?? 1;
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const isActive = dto.isActive ?? true;

    assertVoucherConfigValid({
      type,
      value,
      maxDiscount,
      minOrderValue,
      quantity,
      usedCount: 0,
      usagePerUserLimit,
      startDate,
      endDate,
    });

    const data = {
      code,
      type: type as unknown as any,
      value,
      maxDiscount,
      minOrderValue,
      quantity,
      usagePerUserLimit,
      startDate,
      endDate,
      isActive,
    };

    try {
      return await this.repo.create(data);
    } catch (e: any) {
      if (e?.code === 'P2002') throw new ConflictException('Voucher code already exists');
      throw e;
    }
  }

  async update(id: string, dto: UpdateVoucherDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Voucher not found');

    const nextCode = dto.code != null ? normalizeVoucherCode(dto.code) : existing.code;
    const nextType = (dto.type ?? (existing.type as unknown as VoucherTypeDto)) as VoucherTypeDto;
    const nextValue = dto.value ?? Number(existing.value);
    const nextMaxDiscount =
      dto.type === VoucherTypeDto.FIXED
        ? null
        : dto.maxDiscount !== undefined
          ? dto.maxDiscount ?? null
          : existing.maxDiscount == null
            ? null
            : Number(existing.maxDiscount);
    const nextMinOrderValue = dto.minOrderValue ?? Number(existing.minOrderValue);
    const nextQuantity = dto.quantity ?? existing.quantity;
    const nextUsagePerUserLimit = dto.usagePerUserLimit ?? existing.usagePerUserLimit;
    const nextStartDate = dto.startDate != null ? new Date(dto.startDate) : existing.startDate;
    const nextEndDate = dto.endDate != null ? new Date(dto.endDate) : existing.endDate;
    const nextIsActive = dto.isActive ?? existing.isActive;

    assertVoucherConfigValid({
      type: nextType,
      value: nextValue,
      maxDiscount: nextMaxDiscount,
      minOrderValue: nextMinOrderValue,
      quantity: nextQuantity,
      usedCount: existing.usedCount,
      usagePerUserLimit: nextUsagePerUserLimit,
      startDate: nextStartDate,
      endDate: nextEndDate,
    });

    try {
      return await this.repo.update(id, {
        code: nextCode,
        type: nextType as unknown as any,
        value: nextValue,
        maxDiscount: nextMaxDiscount,
        minOrderValue: nextMinOrderValue,
        quantity: nextQuantity,
        usagePerUserLimit: nextUsagePerUserLimit,
        startDate: nextStartDate,
        endDate: nextEndDate,
        isActive: nextIsActive,
      });
    } catch (e: any) {
      if (e?.code === 'P2002') throw new ConflictException('Voucher code already exists');
      throw e;
    }
  }

  async delete(id: string) {
    try {
      return await this.repo.delete(id);
    } catch (e: any) {
      if (e?.code === 'P2025') throw new NotFoundException('Voucher not found');
      throw e;
    }
  }

  async list(query: AdminListVoucherQuery) {
    const now = new Date();
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.q) {
      where.code = { contains: normalizeVoucherCode(query.q), mode: 'insensitive' };
    }
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.type) where.type = query.type as any;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    // status filter is derived, so we filter coarsely in DB then refine in memory
    if (query.status === VoucherStatusDto.UPCOMING) {
      where.startDate = { gt: now };
    } else if (query.status === VoucherStatusDto.EXPIRED) {
      where.endDate = { lt: now };
    } else if (query.status === VoucherStatusDto.RUNNING) {
      where.startDate = { lte: now };
      where.endDate = { gte: now };
      where.isActive = true;
    }

    const { items, total } = await this.repo.list({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const ids = items.map((v) => v.id);
    const lastUsedAtMap = await this.repo.lastUsedAtByVoucherIds(ids);

    const mapped = items
      .map((v) => {
        const remaining = v.quantity - v.usedCount;
        const usageRate = v.quantity > 0 ? v.usedCount / v.quantity : 0;
        const status = computeStatus(v, now);
        return {
          ...v,
          remaining,
          usageRate,
          status,
          lastUsedAt: lastUsedAtMap.get(v.id) ?? null,
        };
      })
      .filter((v) => {
        if (!query.status) return true;
        if (query.status === VoucherStatusDto.OUT_OF_STOCK) return v.remaining <= 0;
        return v.status === query.status;
      });

    // If we filtered out-of-stock in-memory, total may diverge; keep it simple for now.
    // For exact totals under derived filters, we’d need SQL expressions or separate count queries.
    return {
      page,
      limit,
      total,
      items: mapped,
    };
  }
}

