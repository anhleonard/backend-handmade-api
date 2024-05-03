import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderStatusDto {
  @IsOptional()
  @IsBoolean()
  isAccepted: boolean;

  @IsOptional()
  @IsEnum(OrderStatus)
  // @IsIn([OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.PROCESSING])
  status: OrderStatus;
}
