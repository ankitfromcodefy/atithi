import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RawWebhookEvent } from '../entities/raw-webhook-event.entity';
import { ChannelType } from '../../common/enums';

@Injectable()
export class RawWebhookEventsService {
  constructor(
    @InjectRepository(RawWebhookEvent)
    private readonly repo: Repository<RawWebhookEvent>,
  ) {}

  async existsByExternalMessageId(externalMessageId: string): Promise<boolean> {
    return this.repo.exists({ where: { externalMessageId } });
  }

  async create(data: {
    channel: ChannelType;
    eventType: string;
    externalMessageId: string;
    rawPayload: Record<string, any>;
    processed: boolean;
  }): Promise<RawWebhookEvent> {
    const event = this.repo.create(data);
    return this.repo.save(event);
  }
}
