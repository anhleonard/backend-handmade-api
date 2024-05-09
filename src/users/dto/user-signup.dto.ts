import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Matches,
  MinLength,
} from 'class-validator';
import { Genders, Roles } from 'src/utility/common/user-roles.enum';

export class UserSignUpDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Email can not be empty.' })
  @IsEmail({}, { message: 'Pleadse provide a valid email.' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password can not be empty.' })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Name can not be null' })
  @IsString({ message: 'Name should be string' })
  name: string;

  @ApiProperty()
  @IsOptional()
  @IsEnum(Genders, { message: 'Gender should be enum' })
  gender: Genders;

  @ApiProperty()
  @IsOptional()
  dateOfBirth: Date;

  @ApiProperty()
  @IsNotEmpty({ message: 'Role can not be null' })
  @IsEnum(Roles, { message: 'Role should be enum' })
  role: Roles;

  @ApiProperty()
  @IsNotEmpty({ message: 'Phone number can not be null' })
  @IsString({ message: 'Phone number should be enum' })
  @Matches(/^\d+$/, { message: 'Phone number should contain only digits' })
  phoneNumber: string;
}
