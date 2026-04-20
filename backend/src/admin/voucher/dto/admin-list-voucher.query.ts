import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { VoucherTypeDto } from './voucher-type.enum';

export enum VoucherStatusDto {
  UPCOMING = 'upcoming',
  RUNNING = 'running',
  EXPIRED = 'expired',
  OUT_OF_STOCK = 'outOfStock',
}

export class AdminListVoucherQuery {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsEnum(VoucherTypeDto)
  type?: VoucherTypeDto;

  @IsOptional()
  @IsEnum(VoucherStatusDto)
  status?: VoucherStatusDto;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @IsIn([10, 20, 50, 100])
  limit?: number = 20;
}

