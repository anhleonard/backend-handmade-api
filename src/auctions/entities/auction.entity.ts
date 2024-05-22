import { ShippingEntity } from 'src/shippings/entities/shipping.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Timestamp,
} from 'typeorm';
import { ProgressEntity } from './progress.entity';
import { AuctionStatus } from '../enum/auction.enum';
import { BidderEntity } from './bidder.entity';

@Entity({ name: 'auctions' })
export class AuctionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isAccepted: boolean; //được admin accept chưa

  @Column({ nullable: true })
  additionalComment: string; //nếu ko oke, admin yêu cầu sửa lại

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column()
  requiredNumber: number;

  @Column()
  maxAmount: number;

  @CreateDateColumn()
  createdAt: Timestamp;

  @CreateDateColumn()
  updatedAt: Date;

  @Column()
  closedDate: Date;

  @Column()
  maxDays: number; //số ngày mà dự án nên hoàn thành sau khi đấu giá xong

  @Column()
  deposit: number; // lợi nhuận

  @BeforeInsert()
  calculateDeposit() {
    if (!this.deposit) {
      this.deposit = 0.3 * this.maxAmount;
    }
  }

  @Column({ default: false })
  readyToLaunch: boolean; //đã ss được giao hay chưa

  @Column({
    type: 'enum',
    enum: AuctionStatus,
    nullable: true,
  })
  status: string;

  @ManyToOne(() => UserEntity, (user) => user.auctions)
  owner: UserEntity;

  @ManyToOne(() => ShippingEntity, (shipping) => shipping.auctions)
  shipping: ShippingEntity;

  @OneToMany(() => ProgressEntity, (pro) => pro.auction)
  progresses: ProgressEntity[];

  @OneToMany(() => BidderEntity, (bidder) => bidder.auction)
  candidates: BidderEntity[];

  @ManyToOne(() => UserEntity, (user) => user.auctions)
  canceledBy: UserEntity;
}
