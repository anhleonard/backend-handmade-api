import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { UserSignInDto } from './user-signin.dto';
import { Genders, Roles } from 'src/utility/common/user-roles.enum';

export class UserSignUpDto extends UserSignInDto {
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
