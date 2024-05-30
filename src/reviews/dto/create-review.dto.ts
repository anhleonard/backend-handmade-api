import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty({ message: 'orderId should not be empty.' })
  @IsNumber({}, { message: 'orderId should be number' })
  orderId: number;

  @IsNotEmpty({ message: 'productId should not be empty.' })
  @IsNumber({}, { message: 'productId should be number' })
  productId: number;

  @IsNotEmpty({ message: 'ratings could not be empty' })
  @IsNumber()
  @Min(1)
  @Max(5)
  ratings: number;

  @IsNotEmpty({ message: 'comment should not be empty' })
  @IsString()
  comment: string;
}
