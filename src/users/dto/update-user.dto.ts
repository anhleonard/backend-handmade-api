import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Genders } from 'src/utility/common/user-roles.enum';

export class UpdateUserDto {
  @IsOptional()
  @IsString({ message: 'Name should be string' })
  name: string;

  @IsOptional()
  @IsEnum(Genders)
  gender: Genders;

  @IsOptional()
  @IsString({ message: 'phone number should be string' })
  phoneNumber: string;

  @IsOptional()
  @IsString({ message: 'avatar should be string' })
  avatar: string;
}
