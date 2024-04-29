import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStoreDto {
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
}
