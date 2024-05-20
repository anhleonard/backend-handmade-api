import { IsEnum, IsNotEmpty } from 'class-validator';
import { AuctionStatus } from 'src/auctions/enum/auction.enum';

export class UpdateAuctionStatusDto {
  @IsNotEmpty({ message: 'status can not be empty.' })
  @IsEnum(AuctionStatus)
  status: AuctionStatus;
}
