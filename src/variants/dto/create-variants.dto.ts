import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVariantDto {
  @IsNotEmpty({ message: 'variantName can not be blank.' })
  @IsString()
  variantName: string;
}
