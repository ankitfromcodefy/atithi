import { Controller, Post, Body, Logger, HttpCode } from '@nestjs/common';
import { EmailProcessorService } from '../services/email-processor.service';

interface PubSubPushPayload {
  message: {
    data: string;
    messageId: string;
    publishTime: string;
  };
  subscription: string;
}

@Controller('webhooks')
export class EmailWebhookController {
  private readonly logger = new Logger(EmailWebhookController.name);

  constructor(private readonly emailProcessor: EmailProcessorService) {}

  @Post('email')
  @HttpCode(200)
  async handleEmailNotification(
    @Body() body: PubSubPushPayload,
  ): Promise<{ status: string }> {
    this.logger.log(
      `Received Pub/Sub notification: messageId=${body.message.messageId}`,
    );

    try {
      await this.emailProcessor.processNotification(body.message.data);
    } catch (error) {
      this.logger.error('Failed to process email notification', error);
    }

    return { status: 'ok' };
  }
}
