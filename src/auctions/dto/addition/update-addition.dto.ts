import { IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { CreateAdditionDto } from './create-addition.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateAdditionDto extends PartialType(CreateAdditionDto) {
  @IsOptional()
  @IsBoolean()
  isAccepted: boolean;
}
