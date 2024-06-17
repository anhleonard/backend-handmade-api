import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateStoreDto {
  @IsNotEmpty({ message: 'seller id is not empty' })
  @IsNumber()
  sellerId: number;

  @IsNotEmpty({ message: 'store name is not empty' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'store avatar is not empty' })
  @IsString()
  avatar: string;

  @IsNotEmpty({ message: 'store desc is not empty' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'store main business is not empty' })
  @IsString()
  mainBusiness: string;

  @IsNotEmpty({ message: 'address is not empty' })
  @IsString()
  address: string;

  @IsNotEmpty({ message: 'frontCard is not empty' })
  @IsString()
  frontCard: string;

  @IsNotEmpty({ message: 'backCard is not empty' })
  @IsString()
  backCard: string;
}
