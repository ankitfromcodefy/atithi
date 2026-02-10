import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Base, PrefixType } from '../../base/base.entity';
import {
  ChannelType,
  DirectionType,
  MessageType,
  ProcessingStatusType,
} from '../../common/enums';
import { Guest } from '../../guests/entities/guest.entity';
import { RawWebhookEvent } from './raw-webhook-event.entity';

@Entity('chat_messages')
@Index(['guestId', 'processingStatus'])
@Index(['guestId', 'createdAt'])
export class ChatMessage extends Base {
  constructor() {
    super(PrefixType.ChatMessage);
  }

  @Column({ name: 'guest_id', type: 'varchar' })
  guestId!: string;

  @ManyToOne(() => Guest)
  @JoinColumn({ name: 'guest_id' })
  guest!: Guest;

  @Column({ name: 'booking_id', type: 'varchar', nullable: true })
  bookingId!: string | null;

  @Column({ type: 'enum', enum: ChannelType })
  channel!: ChannelType;

  @Column({ type: 'enum', enum: DirectionType })
  direction!: DirectionType;

  @Column({
    name: 'message_type',
    type: 'enum',
    enum: MessageType,
    default: MessageType.Text,
  })
  messageType!: MessageType;

  @Column({ type: 'text', nullable: true })
  content!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  subject!: string | null;

  @Column({
    name: 'external_message_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @Index({ unique: true })
  externalMessageId!: string | null;

  @Column({ name: 'thread_id', type: 'varchar', length: 255, nullable: true })
  threadId!: string | null;

  @Column({
    name: 'sender_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  senderName!: string | null;

  @Column({
    name: 'sender_identifier',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  senderIdentifier!: string | null;

  @Column({
    name: 'processing_status',
    type: 'enum',
    enum: ProcessingStatusType,
    default: ProcessingStatusType.Received,
  })
  processingStatus!: ProcessingStatusType;

  @Column({ type: 'jsonb', default: '{}' })
  metadata!: Record<string, any>;

  @Column({ name: 'raw_event_id', type: 'varchar', nullable: true })
  rawEventId!: string | null;

  @ManyToOne(() => RawWebhookEvent)
  @JoinColumn({ name: 'raw_event_id' })
  rawEvent!: RawWebhookEvent;
}
