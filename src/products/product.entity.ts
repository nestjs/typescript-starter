import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsOptional } from 'class-validator';
import PublicFile from '../files/public-file.entity';

export enum productsCategory {
  MEAT = 'MEAT',
  DAIRY = 'DAIRY',
  ALCOHOL = 'ALCOHOL',
}

@Entity('product')
class Product {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  public priceInDollars: number;

  @Column({
    type: 'enum',
    enum: productsCategory,
    nullable: true,
  })
  @IsOptional()
  public category?: productsCategory;

  @DeleteDateColumn()
  deletedAt?: Date;

  @JoinColumn()
  @OneToOne(() => PublicFile, {
    eager: true,
    nullable: true,
  })
  public image?: PublicFile;
}

export default Product;
