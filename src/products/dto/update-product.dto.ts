import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ProductStatus } from '../enum/product.enum';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsEnum(ProductStatus)
  status: ProductStatus;

  @IsOptional()
  @IsString()
  rejectReason: string;

  @IsOptional()
  @IsString()
  editHint: string;
}
