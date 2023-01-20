import {
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Transform } from 'class-transformer';

export enum productsCategory {
  MEAT = 'meat',
  DAIRY = 'dairy',
  ALCOHOL = 'alcohol',
}

@Entity('product')
class Product {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column({type: "decimal", precision: 10, scale: 2})
  public priceInDollars: number;

  @Column({
    type: 'enum',
    enum: productsCategory,
    nullable: true
  })
  @Transform(({ value }) => {
    if (value !== null) {
      return value;
    }
  })
  public category?: string;

  @DeleteDateColumn()
  deletedAt?: Date;
}

export default Product;
