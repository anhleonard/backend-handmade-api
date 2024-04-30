import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateReportReviewDto {
  @IsNotEmpty({ message: 'Review should not be empty.' })
  @IsNumber({}, { message: 'Review Id should be number' })
  reviewId: number;

  @IsNotEmpty({ message: 'reportedReason should not be empty.' })
  @IsString({ message: 'reportedReason should be string' })
  reportedReason: string;
}
