import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAuctionDto {
  @IsNotEmpty({ message: 'name can not be empty.' })
  @IsString({ message: 'name should be string.' })
  name: string;

  @IsNotEmpty({ message: 'description can not be empty.' })
  @IsString({ message: 'description should be string.' })
  description: string;

  @IsOptional()
  @IsArray({ message: 'images should be array.' })
  images: string[];

  @IsNotEmpty({ message: 'requiredNumber can not be empty.' })
  @IsNumber()
  requiredNumber: number;

  @IsNotEmpty({ message: 'maxAmount can not be empty.' })
  @IsNumber()
  maxAmount: number;

  @IsNotEmpty({ message: 'closedDate can not be empty.' })
  closedDate: Date;

  @IsNotEmpty({ message: 'shippingId can not be empty.' })
  shippingId: number;
}
