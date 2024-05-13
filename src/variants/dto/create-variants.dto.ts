import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateVariantDto {
  @IsNotEmpty({ message: 'unitPrice can not be blank.' })
  @IsNumber()
  unitPrice: number;

  @IsNotEmpty({ message: 'inventoryNumber can not be blank.' })
  @IsNumber()
  inventoryNumber: number;

  @IsNotEmpty({ message: 'image can not be blank.' })
  @IsString()
  image: string;

  @IsNotEmpty({ message: 'variantItemIds can not be blank.' })
  @IsArray()
  variantItemIds: string[];
}
