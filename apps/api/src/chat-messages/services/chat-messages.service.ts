import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../entities/chat-message.entity';
import {
  ChannelType,
  DirectionType,
  MessageType,
  ProcessingStatusType,
} from '../../common/enums';

@Injectable()
export class ChatMessagesService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly repo: Repository<ChatMessage>,
  ) {}

  async create(data: {
    guestId: string;
    channel: ChannelType;
    direction: DirectionType;
    messageType: MessageType;
    content: string | null;
    subject: string | null;
    externalMessageId: string | null;
    threadId: string | null;
    senderName: string | null;
    senderIdentifier: string | null;
    processingStatus: ProcessingStatusType;
    metadata: Record<string, any>;
    rawEventId: string | null;
  }): Promise<ChatMessage> {
    const message = this.repo.create(data);
    return this.repo.save(message);
  }
}
