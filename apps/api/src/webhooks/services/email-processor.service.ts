import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GmailService } from '../../gmail/services/gmail.service';
import { EmailParserService } from './email-parser.service';
import { NormalizerService } from './normalizer.service';
import { GuestsService } from '../../guests/services/guests.service';
import { SystemStateService } from '../../chat-messages/services/system-state.service';
import { RawWebhookEventsService } from '../../chat-messages/services/raw-webhook-events.service';
import { ChatMessagesService } from '../../chat-messages/services/chat-messages.service';
import { ChannelType } from '../../common/enums';

const HISTORY_ID_KEY = 'gmail_history_id';

@Injectable()
export class EmailProcessorService {
  private readonly logger = new Logger(EmailProcessorService.name);
  private readonly hotelEmail: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly gmailService: GmailService,
    private readonly emailParser: EmailParserService,
    private readonly normalizer: NormalizerService,
    private readonly guestsService: GuestsService,
    private readonly systemStateService: SystemStateService,
    private readonly rawWebhookEventsService: RawWebhookEventsService,
    private readonly chatMessagesService: ChatMessagesService,
  ) {
    this.hotelEmail = this.configService
      .get<string>('GMAIL_USER_EMAIL', '')
      .toLowerCase();
  }

  async processNotification(pubsubData: string): Promise<void> {
    const decoded = JSON.parse(
      Buffer.from(pubsubData, 'base64').toString('utf-8'),
    ) as { emailAddress: string; historyId: number };

    const incomingHistoryId = String(decoded.historyId);
    this.logger.log(`Pub/Sub notification: historyId=${incomingHistoryId}`);

    const storedHistoryId = await this.systemStateService.get(HISTORY_ID_KEY);
    if (!storedHistoryId || storedHistoryId === '0') {
      this.logger.warn(
        'No stored historyId. Storing incoming and skipping this notification.',
      );
      await this.systemStateService.set(HISTORY_ID_KEY, incomingHistoryId);
      return;
    }

    if (BigInt(incomingHistoryId) <= BigInt(storedHistoryId)) {
      this.logger.log(
        `Skipping: incoming ${incomingHistoryId} <= stored ${storedHistoryId}`,
      );
      return;
    }

    let messageIds: string[];
    let latestHistoryId: string;

    try {
      const history = await this.gmailService.fetchHistory(storedHistoryId);
      messageIds = history.messageIds;
      latestHistoryId = history.latestHistoryId;
    } catch (error: any) {
      if (error?.code === 404 || error?.status === 404) {
        this.logger.warn(
          'History ID expired. Recovering with current profile.',
        );
        const profile = await this.gmailService.getProfile();
        await this.systemStateService.set(HISTORY_ID_KEY, profile.historyId);
        return;
      }
      throw error;
    }

    if (messageIds.length === 0) {
      this.logger.log('No new messages in history batch.');
      await this.systemStateService.set(HISTORY_ID_KEY, latestHistoryId);
      return;
    }

    this.logger.log(`Found ${messageIds.length} new message(s) to process.`);

    for (const messageId of messageIds) {
      try {
        await this.processMessage(messageId);
      } catch (error) {
        this.logger.error(`Failed to process message ${messageId}`, error);
      }
    }

    await this.systemStateService.set(HISTORY_ID_KEY, latestHistoryId);
  }

  private async processMessage(messageId: string): Promise<void> {
    const gmailMessage = await this.gmailService.fetchMessage(messageId);

    const labelIds = gmailMessage.labelIds ?? [];
    if (!labelIds.includes('INBOX')) {
      this.logger.log(`Skipping ${messageId}: not in INBOX`);
      return;
    }

    const fromHeader =
      gmailMessage.payload?.headers?.find(
        (h) => h.name?.toLowerCase() === 'from',
      )?.value ?? '';
    const fromMatch = fromHeader.match(/<([^>]+)>/);
    const fromEmail = (fromMatch ? fromMatch[1] : fromHeader)
      .trim()
      .toLowerCase();
    if (fromEmail === this.hotelEmail) {
      this.logger.log(`Skipping ${messageId}: from hotel's own address`);
      return;
    }

    if (
      await this.rawWebhookEventsService.existsByExternalMessageId(
        gmailMessage.id!,
      )
    ) {
      this.logger.log(`Skipping ${messageId}: already processed (dedup)`);
      return;
    }

    let parsed;
    try {
      parsed = await this.emailParser.parse(gmailMessage);
    } catch (error) {
      this.logger.error(`Failed to parse email ${messageId}`, error);
      await this.rawWebhookEventsService.create({
        channel: ChannelType.Email,
        eventType: 'message',
        externalMessageId: gmailMessage.id!,
        rawPayload: gmailMessage as Record<string, any>,
        processed: false,
      });
      return;
    }

    const normalized = this.normalizer.normalize(gmailMessage, parsed);

    const guest = await this.guestsService.findOrCreateByEmail(
      parsed.senderEmail,
      parsed.senderName,
    );

    const rawEvent = await this.rawWebhookEventsService.create({
      channel: ChannelType.Email,
      eventType: 'message',
      externalMessageId: gmailMessage.id!,
      rawPayload: gmailMessage as Record<string, any>,
      processed: true,
    });

    await this.chatMessagesService.create({
      guestId: guest.hash,
      channel: normalized.channel,
      direction: normalized.direction,
      messageType: normalized.messageType,
      content: normalized.content,
      subject: normalized.subject,
      externalMessageId: normalized.externalMessageId,
      threadId: normalized.threadId,
      senderName: normalized.senderName,
      senderIdentifier: normalized.senderIdentifier,
      processingStatus: normalized.processingStatus,
      metadata: normalized.metadata,
      rawEventId: rawEvent.hash,
    });

    this.logger.log(
      `Processed email ${messageId} from ${parsed.senderEmail} (guest: ${guest.hash})`,
    );
  }
}
