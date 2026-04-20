import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { VoucherTypeDto } from './voucher-type.enum';

export class CreateVoucherDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9_-]+$/i)
  code!: string;

  @IsEnum(VoucherTypeDto)
  type!: VoucherTypeDto;

  @IsNumber()
  @Min(0.01)
  value!: number;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  maxDiscount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderValue?: number;

  @IsInt()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  usagePerUserLimit?: number;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

