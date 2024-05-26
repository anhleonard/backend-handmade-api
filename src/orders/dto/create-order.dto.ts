import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

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
}
