import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../admin.guard';
import { AdminVoucherService } from './admin-voucher.service';
import { AdminListVoucherQuery } from './dto/admin-list-voucher.query';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';

@Controller('admin/voucher')
@UseGuards(AdminGuard)
export class AdminVoucherController {
  constructor(private readonly service: AdminVoucherService) {}

  @Post()
  create(@Body() dto: CreateVoucherDto) {
    return this.service.create(dto);
  }

  @Get()
  list(@Query() query: AdminListVoucherQuery) {
    return this.service.list(query);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}

