import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class ProductEntity {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column()
    public name: string;

    @Column()
    public priceInDollars: number;
}

export default ProductEntity;