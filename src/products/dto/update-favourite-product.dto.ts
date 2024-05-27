import { IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateFavouriteProducts {
  @IsNotEmpty({ message: 'productId can not be blank.' })
  @IsNumber()
  productId: number;

  @IsNotEmpty({ message: 'isAdd can not be blank.' })
  @IsBoolean()
  isAdd: boolean;
}
