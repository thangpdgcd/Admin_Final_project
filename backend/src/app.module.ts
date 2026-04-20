import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AdminVoucherModule } from './admin/voucher/admin-voucher.module';
import { VoucherModule } from './voucher/voucher.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SupportChatModule } from './support-chat/support-chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AdminVoucherModule,
    VoucherModule,
    AuthModule,
    UsersModule,
    SupportChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
