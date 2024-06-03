import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsBoolean()
  isReadyDelivery: boolean;

  @IsOptional()
  @IsBoolean()
  isMinusPoint: boolean;
}
