import { PartialType } from '@nestjs/mapped-types';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateOrderProductDto } from './create-order-product.dto';

export class UpdateOrderProductDto {
  @IsOptional()
  @IsNumber()
  productQuantity: number;

  @IsOptional()
  @IsBoolean()
  isSelected: boolean;

  @IsOptional()
  @IsString()
  code: string;
}
