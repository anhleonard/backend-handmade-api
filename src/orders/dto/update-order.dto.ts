import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class UpdateOrderDto {
  @IsOptional()
  @IsBoolean()
  isAccepted: boolean;

  @IsOptional()
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
