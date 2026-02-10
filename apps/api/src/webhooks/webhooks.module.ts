import { Module } from '@nestjs/common';
import { GmailModule } from '../gmail/gmail.module';
import { GuestsModule } from '../guests/guests.module';
import { ChatMessagesModule } from '../chat-messages/chat-messages.module';
import { EmailWebhookController } from './controllers/email-webhook.controller';
import { EmailProcessorService } from './services/email-processor.service';
import { EmailParserService } from './services/email-parser.service';
import { NormalizerService } from './services/normalizer.service';

@Module({
  imports: [GmailModule, GuestsModule, ChatMessagesModule],
  controllers: [EmailWebhookController],
  providers: [EmailProcessorService, EmailParserService, NormalizerService],
})
export class WebhooksModule {}
