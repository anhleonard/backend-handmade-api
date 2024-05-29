import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AuctionEntity } from './auction.entity';

@Entity({ name: 'paid_auctions' })
export class PaidAuctionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: false })
  isRefund: boolean; //đã hoàn tiền hay chưa

  @Column()
  type: string; //"deposit" or "total" <total means total - deposit>

  //thông số về payment
  @Column()
  apptransid: string;

  @Column()
  zp_trans_id: string;

  @ManyToOne(() => AuctionEntity, (auction) => auction.paids)
  auction: AuctionEntity;
}
