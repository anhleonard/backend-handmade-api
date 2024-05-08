import { PartialType } from '@nestjs/mapped-types';
import { CreateAuctionDto } from './create-auction.dto';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateAuctionDto extends PartialType(CreateAuctionDto) {
  @IsOptional()
  @IsBoolean({ message: 'isAccepted should be boolean.' })
  isAccepted: boolean;

  @IsOptional()
  @IsString({ message: 'additionalComment should be string.' })
  additionalComment: string;
}
