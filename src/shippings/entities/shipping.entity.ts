import { OrderEntity } from 'src/orders/entities/order.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReceivingPlaces } from '../enum/shippings.enum';
import { UserEntity } from 'src/users/entities/user.entity';

@Entity({ name: 'shippings' })
export class ShippingEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phone: string;

  @Column({ default: ' ' })
  name: string;

  @Column()
  province: string; //tỉnh

  @Column()
  district: string; //huyện

  @Column()
  ward: string; // xã

  @Column()
  detailAddress: string;

  @Column()
  isDefaultAddress: boolean;

  @Column()
  receivePlace: ReceivingPlaces; //nơi nhận hàng

  @Column({ nullable: true })
  companyName: string; // nơi làm việc

  @OneToOne(() => OrderEntity, (order) => order.shippingAddress)
  order: OrderEntity;

  @ManyToOne(() => UserEntity, (user) => user.shippings)
  user: UserEntity;
}
