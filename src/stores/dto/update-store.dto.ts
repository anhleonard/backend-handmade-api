import { IsOptional, IsString } from 'class-validator';

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  avatar: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  mainBusiness: string;
}
