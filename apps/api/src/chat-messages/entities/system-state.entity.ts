import {
  Entity,
  Column,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('system_state')
export class SystemState {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  key!: string;

  @Column({ type: 'text' })
  value!: string;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date = new Date();
}
