import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Service } from './service.entity';

export interface Tool {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
}

@Entity('service_tools')
export class ServiceTools {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'service_id' })
  serviceId: string;

  @Column('jsonb', { default: [] })
  tools: Tool[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;

  @OneToOne(() => Service, (service) => service.tools)
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
