import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserSignInDto {
  @IsNotEmpty({ message: 'Email can not be empty.' })
  @IsEmail({}, { message: 'Pleadse provide a valid email.' })
  email: string;

  @IsNotEmpty({ message: 'Password can not be empty.' })
  password: string;
}
