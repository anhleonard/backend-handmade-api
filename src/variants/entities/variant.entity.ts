import { ProductEntity } from 'src/products/entities/product.entity';
import { VariantItemEntity } from 'src/variant_items/entities/variant-item.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('variants')
export class VariantEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  unitPrice: number;

  @Column()
  inventoryNumber: number;

  @Column()
  image: string;

  @OneToMany(() => VariantItemEntity, (item) => item.variants)
  options: VariantItemEntity[];

  @ManyToOne(() => ProductEntity, (product) => product.variants)
  product: ProductEntity;
}
