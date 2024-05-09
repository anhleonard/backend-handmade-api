import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserSignInDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'Email can not be empty.' })
  @IsEmail({}, { message: 'Pleadse provide a valid email.' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'Password can not be empty.' })
  password: string;
}
