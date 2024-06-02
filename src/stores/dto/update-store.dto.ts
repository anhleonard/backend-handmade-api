import { IsEnum, IsOptional, IsString } from 'class-validator';
import { StoreStatus } from '../enum/stores.enum';

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

  @IsOptional()
  @IsString()
  address: string;

  @IsOptional()
  @IsEnum(StoreStatus)
  status: StoreStatus;

  @IsOptional()
  @IsString()
  bannedReason: string;

  @IsOptional()
  @IsString()
  notApproveReason: string;
}
