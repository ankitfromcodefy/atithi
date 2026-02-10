import { Entity, Column, Index } from 'typeorm';
import { Base, PrefixType } from '../../base/base.entity';
import { ChannelType } from '../../common/enums';

@Entity('raw_webhook_events')
export class RawWebhookEvent extends Base {
  constructor() {
    super(PrefixType.RawWebhookEvent);
  }

  @Column({ type: 'enum', enum: ChannelType })
  channel!: ChannelType;

  @Column({ name: 'event_type', type: 'varchar', length: 50 })
  eventType!: string;

  @Column({ name: 'external_message_id', type: 'varchar', length: 255 })
  @Index({ unique: true })
  externalMessageId!: string;

  @Column({ name: 'raw_payload', type: 'jsonb' })
  rawPayload!: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  processed!: boolean;
}
