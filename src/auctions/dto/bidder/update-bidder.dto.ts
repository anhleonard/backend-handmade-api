import { IsBoolean, IsOptional } from 'class-validator';
import { CreateBidderDto } from './create-bidder.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateBidderDto extends PartialType(CreateBidderDto) {
  @IsOptional()
  @IsBoolean({ message: 'isSelected should be boolean.' })
  isSelected: boolean;
}
