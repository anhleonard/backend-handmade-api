import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { ReceivingPlaces } from '../enum/shippings.enum';

export class UpdateShippingDto {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  province: string;

  @IsOptional()
  @IsString()
  district: string;

  @IsOptional()
  @IsString()
  ward: string;

  @IsOptional()
  @IsString()
  detailAddress: string;

  @IsOptional()
  @IsBoolean()
  isDefaultAddress: boolean;

  @IsOptional()
  @IsEnum(ReceivingPlaces)
  receivePlace: ReceivingPlaces; //nơi nhận hàng // enum home or comany

  @IsOptional()
  @IsString()
  companyName: string; // nơi làm việc
}
