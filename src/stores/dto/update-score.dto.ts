import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { EnumScore, TypeScore } from 'src/constants/enums';

export class UpdateScoreDto {
  @IsNotEmpty({ message: 'store id is not empty' })
  @IsNumber()
  storeId: number;

  @IsNotEmpty({ message: 'type is not empty' })
  @IsEnum(TypeScore)
  type: TypeScore;

  @IsNotEmpty({ message: 'amount is not empty' })
  @IsEnum(EnumScore)
  amount: EnumScore;
}
