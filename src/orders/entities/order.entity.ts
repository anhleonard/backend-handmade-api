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
import { OrderProductEntity } from '../../order_products/entities/order-products.entity';
import { StoreEntity } from 'src/stores/entities/stores.entity';

@Entity({ name: 'orders' })
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ default: false })
  isAccepted: boolean; // đã được duyệt bởi seller hay chưa

  // chỉ xuất hiện khi isAccepted by seller là true
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.WAITING_PAYMENT,
  })
  status: string;

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

  @OneToMany(() => OrderProductEntity, (op) => op.order, {
    onDelete: 'SET NULL',
    cascade: true,
  })
  orderProducts: OrderProductEntity[];

  @ManyToOne(() => UserEntity, (user) => user.orders)
  client: UserEntity;

  @ManyToOne(() => StoreEntity, (store) => store.orders)
  store: StoreEntity;
}
