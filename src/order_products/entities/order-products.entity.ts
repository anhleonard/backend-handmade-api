import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderEntity } from '../../orders/entities/order.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { VariantEntity } from 'src/variants/entities/variant.entity';
import { UserEntity } from 'src/users/entities/user.entity';

@Entity({ name: 'order_products' }) //set product in cart
export class OrderProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 30 })
  productUnitPrice: number;

  @Column()
  productQuantity: number;

  @Column({ default: false })
  isSelected: boolean;

  @ManyToOne(() => VariantEntity, (variant) => variant.orderProducts, {
    onDelete: 'SET NULL',
  })
  variant: VariantEntity;

  @ManyToOne(() => OrderEntity, (order) => order.orderProducts)
  order: OrderEntity;

  @ManyToOne(() => ProductEntity, (prod) => prod.products, {
    onDelete: 'SET NULL',
  })
  product: ProductEntity;

  @ManyToOne(() => UserEntity, (user) => user.orderProducts, {
    onDelete: 'SET NULL',
  })
  client: UserEntity;
}