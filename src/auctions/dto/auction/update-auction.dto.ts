import { PartialType } from '@nestjs/mapped-types';
import { CreateAuctionDto } from './create-auction.dto';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

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
}
