import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('subscribers')
export default class SubscriberEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  email: string;

  @Column({ default: true })
  subscribed: boolean;

  @Column({ nullable: true })
  name: string;

  @Column({ default: 'general' })
  tag: string;
}
