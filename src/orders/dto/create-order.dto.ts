import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

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
}
