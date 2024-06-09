import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateAdditionDto {
  @IsNotEmpty({ message: 'auctionId can not be empty.' })
  @IsNumber()
  auctionId: number;

  @IsNotEmpty({ message: 'comment can not be empty.' })
  @IsString()
  comment: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  days: number;
}
