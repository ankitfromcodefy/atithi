import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemState } from './entities/system-state.entity';
import { RawWebhookEvent } from './entities/raw-webhook-event.entity';
import { ChatMessage } from './entities/chat-message.entity';
import { SystemStateService } from './services/system-state.service';
import { RawWebhookEventsService } from './services/raw-webhook-events.service';
import { ChatMessagesService } from './services/chat-messages.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemState, RawWebhookEvent, ChatMessage]),
  ],
  providers: [SystemStateService, RawWebhookEventsService, ChatMessagesService],
  exports: [SystemStateService, RawWebhookEventsService, ChatMessagesService],
})
export class ChatMessagesModule {}
