import {
  Column,
  Entity,
  ManyToMany,
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

  @Column({ unique: true, nullable: false })
  code: string;

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

  @ManyToMany(() => OrderEntity, (order) => order.orderProducts)
  orders: OrderEntity[];

  @ManyToOne(() => ProductEntity, (prod) => prod.products, {
    onDelete: 'SET NULL',
  })
  product: ProductEntity;

  @ManyToOne(() => UserEntity, (user) => user.orderProducts, {
    onDelete: 'SET NULL',
  })
  client: UserEntity;
}
