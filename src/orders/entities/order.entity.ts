import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { OrderStatus } from '../enums/order-status.enum';
import { UserEntity } from 'src/users/entities/user.entity';
import { ShippingEntity } from 'src/shippings/entities/shipping.entity';
import { OrderProductsEntity } from './order-products.entity';
import { StoreEntity } from 'src/stores/entities/stores.entity';

@Entity({ name: 'orders' })
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  provisionalAmount: number; // số tiền tạm tính

  @Column()
  discountAmount: number; // tổng số tiền được giảm

  @Column()
  totalPayment: number; //tiền phải trả

  @CreateDateColumn()
  orderAt: Timestamp;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PROCESSING })
  status: string;

  @Column({ nullable: true })
  shippedAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.ordersUpdateBy)
  updatedBy: UserEntity;

  @OneToOne(() => ShippingEntity, (ship) => ship.order, { cascade: true })
  @JoinColumn()
  shippingAddress: ShippingEntity;

  @OneToMany(() => OrderProductsEntity, (op) => op.order, { cascade: true })
  orderProducts: OrderProductsEntity[];

  @ManyToOne(() => UserEntity, (user) => user.orders)
  client: UserEntity;

  @ManyToOne(() => StoreEntity, (store) => store.orders)
  store: StoreEntity;
}
