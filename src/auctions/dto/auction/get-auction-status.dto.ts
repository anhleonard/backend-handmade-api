import { IsBoolean, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { AuctionStatus } from 'src/auctions/enum/auction.enum';

export class GetByAuctionStatus {
  @IsOptional()
  @IsEnum(AuctionStatus)
  status: AuctionStatus | null;

  @IsOptional()
  @IsBoolean()
  overDate: boolean;
}
