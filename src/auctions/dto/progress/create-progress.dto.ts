import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateProgressDto {
  @IsNotEmpty({ message: 'auctionId can not be empty.' })
  @IsNumber()
  auctionId: number;

  @IsNotEmpty({ message: 'comment can not be empty.' })
  @IsString()
  comment: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  percentage: number;
}
