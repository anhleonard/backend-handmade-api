import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateAuctionPaymentDto {
  @IsNotEmpty({ message: 'auctionId is not empty.' })
  @IsNumber()
  auctionId: number;

  @IsNotEmpty({ message: 'amount is not empty.' })
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsBoolean()
  isDepositPayment: boolean;

  @IsOptional()
  @IsBoolean()
  isPaymentFull: boolean;
}
