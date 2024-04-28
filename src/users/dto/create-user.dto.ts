import { IsString } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Name should be string' })
  name: string;
}
