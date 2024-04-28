import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderEntity } from './order.entity';
import { ProductEntity } from 'src/products/entities/product.entity';

@Entity({ name: 'order_products' })
export class OrderProductsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 30, default: 0 })
  productUnitPrice: number;

  @Column()
  productQuantity: number;

  @ManyToOne(() => OrderEntity, (order) => order.orderProducts)
  order: OrderEntity;

  @ManyToOne(() => ProductEntity, (prod) => prod.products, { cascade: true })
  product: ProductEntity;
}
