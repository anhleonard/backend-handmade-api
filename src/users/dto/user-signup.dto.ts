import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
  MinLength,
} from 'class-validator';
import { Genders, Roles } from 'src/utility/common/user-roles.enum';

export class UserSignUpDto {
  @IsNotEmpty({ message: 'Email can not be empty.' })
  @IsEmail({}, { message: 'Pleadse provide a valid email.' })
  email: string;

  @IsNotEmpty({ message: 'Password can not be empty.' })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @IsNotEmpty({ message: 'Name can not be null' })
  @IsString({ message: 'Name should be string' })
  name: string;

  @IsNotEmpty({ message: 'Gender can not be null' })
  @IsEnum(Genders, { message: 'Gender should be enum' })
  gender: Genders;

  @IsNotEmpty({ message: 'Date of birth can not be null' })
  dateOfBirth: Date;

  @IsNotEmpty({ message: 'Role can not be null' })
  @IsEnum(Roles, { message: 'Role should be enum' })
  role: Roles;

  @IsNotEmpty({ message: 'Phone number can not be null' })
  @IsString({ message: 'Phone number should be enum' })
  @Matches(/^\d+$/, { message: 'Phone number should contain only digits' })
  phoneNumber: string;
}
