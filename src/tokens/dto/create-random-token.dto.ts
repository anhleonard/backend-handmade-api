import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRandomTokenDto {
  @IsNotEmpty({ message: 'token is not empty' })
  @IsString()
  token: string;
}
