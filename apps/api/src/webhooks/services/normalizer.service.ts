import { Injectable } from '@nestjs/common';
import { gmail_v1 } from 'googleapis';
import { ParsedEmail } from './email-parser.service';
import {
  ChannelType,
  DirectionType,
  MessageType,
  ProcessingStatusType,
} from '../../common/enums';

export interface NormalizedMessage {
  channel: ChannelType;
  direction: DirectionType;
  messageType: MessageType;
  content: string | null;
  subject: string | null;
  externalMessageId: string;
  threadId: string | null;
  senderName: string | null;
  senderIdentifier: string;
  processingStatus: ProcessingStatusType;
  metadata: Record<string, any>;
}

@Injectable()
export class NormalizerService {
  normalize(
    gmailMessage: gmail_v1.Schema$Message,
    parsed: ParsedEmail,
  ): NormalizedMessage {
    return {
      channel: ChannelType.Email,
      direction: DirectionType.Inbound,
      messageType: MessageType.Text,
      content: parsed.body || null,
      subject: parsed.subject,
      externalMessageId: gmailMessage.id!,
      threadId: gmailMessage.threadId ?? null,
      senderName: parsed.senderName,
      senderIdentifier: parsed.senderEmail,
      processingStatus: ProcessingStatusType.Received,
      metadata: {
        gmail_message_id: gmailMessage.id,
        gmail_thread_id: gmailMessage.threadId,
        original_subject: parsed.subject,
        cc: parsed.cc,
        has_attachments: parsed.hasAttachments,
        is_forwarded: parsed.isForwarded,
        in_reply_to: parsed.inReplyTo,
        message_id_header: parsed.messageIdHeader,
      },
    };
  }
}
