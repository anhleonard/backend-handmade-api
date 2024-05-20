import { StoreEntity } from 'src/stores/entities/stores.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuctionEntity } from './auction.entity';

@Entity({ name: 'bidders' })
export class BidderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  bidderMoney: number;

  @Column()
  estimatedDay: number;
  ProgressEntity;
  @Column()
  selfIntroduce: string;

  @Column({ default: false })
  isSelected: boolean; //bidder này có đc chọn hay không

  @Column({ nullable: true })
  acceptedAt: Date; //bidder này được chọn lúc nào

  @ManyToOne(() => StoreEntity, (store) => store.bidders)
  store: StoreEntity;

  @ManyToOne(() => AuctionEntity, (auction) => auction.candidates)
  auction: AuctionEntity;
}
