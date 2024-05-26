import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty({ message: 'orderedProducts is not empty.' })
  @IsArray()
  orderedProductIds: number[];

  @IsNotEmpty({ message: 'deliveryFee is not empty.' })
  @IsNumber()
  deliveryFee: number;
}
