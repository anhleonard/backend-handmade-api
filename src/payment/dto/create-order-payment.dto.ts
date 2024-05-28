import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateOrderPaymentDto {
  @IsNotEmpty({ message: 'orderedProducts is not empty.' })
  @IsArray()
  orderedProductIds: number[];

  @IsNotEmpty({ message: 'deliveryFee is not empty.' })
  @IsNumber()
  deliveryFee: number;
}
