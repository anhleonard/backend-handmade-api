import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { OrderStatus } from '../enums/order-status.enum';
import { UserEntity } from 'src/users/entities/user.entity';
import { ShippingEntity } from 'src/shippings/entities/shipping.entity';
import { OrderProductEntity } from '../../order_products/entities/order-products.entity';
import { StoreEntity } from 'src/stores/entities/stores.entity';

@Entity({ name: 'orders' })
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  code: string;

  @Column()
  totalAmountItem: number; // tổng số sp đã chọn mua

  @Column()
  provisionalAmount: number; // số tiền tạm tính

  @Column()
  discountAmount: number; // tổng số tiền được giảm

  @Column()
  totalPayment: number; //tiền phải trả

  @CreateDateColumn()
  orderAt: Timestamp;

  @CreateDateColumn()
  updatedAt: Date; //time update order

  @Column({ default: false })
  isCanceled: boolean; // đã được hủy hay chưa

  @Column({ nullable: true })
  canceledReason: string; // lý do hủy

  @Column({ default: false })
  isPaid: boolean; // đã được thanh toán hay chưa

  @Column({ default: false })
  isReadyDelivery: boolean; // đã sẵn sàng giao chưa

  @Column({ nullable: true })
  deliveryFee: number; //phí vận chuyển của đơn hàng

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.WAITING_PAYMENT,
  })
  status: string;

  @Column({ nullable: true })
  processingAt: Date;

  @Column({ nullable: true })
  shippedAt: Date;

  @Column({ nullable: true })
  deliveredAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.ordersUpdateBy)
  updatedBy: UserEntity;

  @ManyToOne(() => ShippingEntity, (ship) => ship.order, {
    onDelete: 'SET NULL',
  })
  shippingAddress: ShippingEntity;

  @ManyToMany(() => OrderProductEntity, (op) => op.orders, {
    onDelete: 'SET NULL',
    cascade: true,
  })
  @JoinTable({ name: 'orders_order_products' })
  orderProducts: OrderProductEntity[];

  @ManyToOne(() => UserEntity, (user) => user.orders)
  client: UserEntity;

  @ManyToOne(() => StoreEntity, (store) => store.orders)
  store: StoreEntity;
}
