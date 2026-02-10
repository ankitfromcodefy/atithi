import { Entity, Column, Index } from 'typeorm';
import { Base, PrefixType } from '../../base/base.entity';
import { SourceType } from '../../common/enums';

@Entity('guests')
export class Guest extends Base {
  constructor() {
    super(PrefixType.Guest);
  }

  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @Index()
  phone!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @Index()
  email!: string | null;

  @Column({ name: 'whatsapp_id', type: 'varchar', length: 50, nullable: true })
  whatsappId!: string | null;

  @Column({ type: 'enum', enum: SourceType })
  source!: SourceType;
}
