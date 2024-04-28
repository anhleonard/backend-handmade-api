import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateVariantItemsDto {
  @IsNotEmpty({ message: 'optionName can not be blank.' })
  @IsString()
  optionName: string;

  @IsNotEmpty({ message: 'variantPrice can not be blank.' })
  @IsNumber()
  @Min(1)
  variantPrice: number;

  @IsNotEmpty({ message: 'inventoryNumber can not be blank.' })
  @IsNumber()
  @Min(1)
  inventoryNumber: number;

  @IsNotEmpty({ message: 'image of item class option can not be blank.' })
  @IsString()
  image: string;
}
