import { Module } from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { AdminVoucherController } from './admin-voucher.controller';
import { AdminVoucherRepository } from './admin-voucher.repository';
import { AdminVoucherService } from './admin-voucher.service';

@Module({
  controllers: [AdminVoucherController],
  providers: [AdminVoucherService, AdminVoucherRepository, AdminGuard],
})
export class AdminVoucherModule {}

