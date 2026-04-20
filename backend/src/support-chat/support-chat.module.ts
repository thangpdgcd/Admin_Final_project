import { Module } from '@nestjs/common';
import { SupportChatGateway } from './support-chat.gateway';

@Module({
  providers: [SupportChatGateway],
})
export class SupportChatModule {}

