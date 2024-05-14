import { OrderProductEntity } from 'src/order_products/entities/order-products.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { VariantItemEntity } from 'src/variant_items/entities/variant-item.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
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

  @ManyToMany(() => VariantItemEntity, (item) => item.variants, {
    onDelete: 'SET NULL',
    cascade: true,
  })
  @JoinTable({ name: 'items_variants' })
  variantItems: VariantItemEntity[];

  @ManyToOne(() => ProductEntity, (product) => product.variants, {
    onDelete: 'SET NULL',
  })
  product: ProductEntity;

  // xem lại
  @OneToMany(() => OrderProductEntity, (order) => order.variant, {
    onDelete: 'SET NULL',
  })
  orderProducts: OrderProductEntity[];

  @ManyToOne(() => UserEntity, (user) => user.variants, {
    onDelete: 'SET NULL',
  })
  addedBy: UserEntity;
}
