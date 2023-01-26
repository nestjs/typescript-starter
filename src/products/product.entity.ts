import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';
import {IsOptional} from "class-validator";

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
  })
  @IsOptional()
  public category?: productsCategory | null;

  @DeleteDateColumn()
  deletedAt?: Date;
}

export default Product;
