import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateApproveProductDto {
  @IsNotEmpty({ message: 'isAccepted can not be blank.' })
  @IsBoolean()
  isAccepted: boolean;

  @IsOptional()
  @IsString()
  rejectReason: string;

  @IsOptional()
  @IsNumber()
  profitMoney: number;
}
