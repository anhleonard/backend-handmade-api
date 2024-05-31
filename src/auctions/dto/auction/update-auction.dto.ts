import { PartialType } from '@nestjs/mapped-types';
import { CreateAuctionDto } from './create-auction.dto';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { AuctionStatus } from 'src/auctions/enum/auction.enum';

export class UpdateAuctionDto extends PartialType(CreateAuctionDto) {
  @IsOptional()
  @IsBoolean({ message: 'isAccepted should be boolean.' })
  isAccepted: boolean; //duyệt auction - admin

  @IsOptional()
  @IsString({ message: 'additionalComment should be string.' })
  additionalComment: string; //lý do từ chối duyệt auction - admin

  @IsOptional()
  @IsBoolean({ message: 'readyToLaunch should be boolean.' })
  readyToLaunch: boolean; //đã ss giao hay chưa - seller

  @IsOptional()
  @IsBoolean({ message: 'isPaymentDeposit should be boolean.' })
  isPaymentDeposit: boolean; //đã thanh toán tiền cọc hay chưa

  @IsOptional()
  @IsBoolean({ message: 'isPaymentFull should be boolean.' })
  isPaymentFull: boolean; //đã thanh toán hết tiền hay chưa

  @IsOptional()
  @IsEnum(AuctionStatus)
  status: AuctionStatus | null;
}
