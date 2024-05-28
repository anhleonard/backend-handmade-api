import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty({ message: 'shippingAddressId is not empty.' })
  @IsNumber()
  shippingAddressId: number;

  @IsNotEmpty({ message: 'orderedProductIds is not empty.' })
  @IsArray()
  orderedProductIds: number[];

  @IsNotEmpty({ message: 'deliveryFee is not empty.' })
  @IsNumber()
  deliveryFee: number;

  @IsNotEmpty({ message: 'isPaid is not empty.' })
  @IsBoolean()
  isPaid: boolean;

  @IsOptional()
  @IsString()
  apptransid: string;

  @IsOptional()
  @IsString()
  zp_trans_id: string;
}
