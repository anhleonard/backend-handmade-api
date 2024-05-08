import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionEntity } from './entities/auction.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { ShippingEntity } from 'src/shippings/entities/shipping.entity';
import { StoreEntity } from 'src/stores/entities/stores.entity';
import { BidderEntity } from './entities/bidder.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuctionEntity,
      UserEntity,
      ShippingEntity,
      StoreEntity,
      BidderEntity,
    ]),
  ],
  providers: [AuctionsService],
  controllers: [AuctionsController],
})
export class AuctionsModule {}
