import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateOrderProductDto {
  @IsNotEmpty({ message: 'product id should not be empty' })
  @IsNumber()
  productId: number;

  @IsNotEmpty({ message: 'product quantity should not be empty' })
  @IsNumber()
  productQuantity: number;

  @IsOptional()
  @IsNumber()
  variantId: number;

  @IsOptional()
  @IsBoolean()
  isSelected: boolean;
}
