import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Item extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt: Date;

  @Column({ name: 'name', type: 'varchar', length: 50 })
  name: string;

  @Column({ name: 'description', type: 'varchar', nullable: true, length: 255 })
  description?: string;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  constructor(item?: Partial<Item>) {
    super();
    this.id = item?.id;
    this.name = item?.name;
    this.updatedAt = item?.updatedAt;
    this.description = item?.description;
    this.quantity = item?.quantity;
  }
}
