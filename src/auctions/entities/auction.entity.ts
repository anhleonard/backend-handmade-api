import { ShippingEntity } from 'src/shippings/entities/shipping.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
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

  @Column()
  closedDate: Date;

  @Column()
  deposit: number;

  @BeforeInsert()
  calculateDeposit() {
    if (!this.deposit) {
      this.deposit = 0.3 * this.maxAmount;
    }
  }

  @Column({ default: false })
  readyToLaunch: boolean;

  @Column({
    type: 'enum',
    enum: AuctionStatus,
    default: AuctionStatus.AUCTIONING,
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
}
