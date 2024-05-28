import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateAuctionPaymentDto {
  @IsNotEmpty({ message: 'auctionId is not empty.' })
  @IsNumber()
  auctionId: number;

  @IsNotEmpty({ message: 'amount is not empty.' })
  @IsNumber()
  amount: number;

  @IsNotEmpty({ message: 'isDepositPayment is not empty.' })
  @IsBoolean()
  isDepositPayment: boolean;
}