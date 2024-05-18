import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateApproveProductDto {
  @IsNotEmpty({ message: 'isAccepted can not be blank.' })
  @IsBoolean()
  isAccepted: boolean;

  @IsOptional()
  @IsString()
  rejectReason: string;

  @IsOptional()
  @IsString()
  editHint: string;
}
