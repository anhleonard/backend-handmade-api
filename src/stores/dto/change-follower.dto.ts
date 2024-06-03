import { IsNotEmpty, IsNumber } from 'class-validator';

export class ChangeFollowerDto {
  @IsNotEmpty({ message: 'store id is not empty' })
  @IsNumber()
  storeId: number;

  @IsNotEmpty({ message: 'user id is not empty' })
  @IsNumber()
  userId: number;
}
