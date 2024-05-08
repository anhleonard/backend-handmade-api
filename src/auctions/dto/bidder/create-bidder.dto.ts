import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateBidderDto {
  @IsNotEmpty({ message: 'auctionId can not be empty.' })
  @IsNumber()
  auctionId: number;

  @IsNotEmpty({ message: 'bidderMoney can not be empty.' })
  @IsNumber()
  bidderMoney: number;

  @IsNotEmpty({ message: 'estimatedDay can not be empty.' })
  @IsNumber()
  estimatedDay: number;

  @IsNotEmpty({ message: 'selfIntroduce can not be empty.' })
  @IsString()
  selfIntroduce: string;
}
