import { Module } from '@nestjs/common';
import { VouchersRepository } from './vouchers.repository';
import { VoucherService } from './voucher.service';

@Module({
  providers: [VouchersRepository, VoucherService],
  exports: [VouchersRepository, VoucherService],
})
export class VoucherModule {}

