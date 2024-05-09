import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'title can not be empty.' })
  @IsString({ message: 'title should be string.' })
  title: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'description can not be empty.' })
  @IsString({ message: 'description should be string.' })
  description: string;
}
