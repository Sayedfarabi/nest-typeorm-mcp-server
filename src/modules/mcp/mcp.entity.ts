import { BaseEntity } from 'src/common/entity/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('call_logs')
export class CallLog extends BaseEntity {
  @Column()
  companyId: string; // SaaS Tenant ID

  @Column({ nullable: true })
  customerId: string;

  @Column('text')
  fullTranscript: string;

  @Column('text', { nullable: true })
  summary: string;

  @Column({ nullable: true })
  recordingUrl: string;

  @Column({ default: false })
  wasTransferred: boolean;
}
