import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Transform } from 'class-transformer';

@Entity('product')
class Product {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column()
  public priceInDollars: string;

  @Column({ nullable: true })
  @Transform(({ value }) => {
    if (value !== null) {
      return value;
    }
  })
  public category?: string;
}

export default Product;
