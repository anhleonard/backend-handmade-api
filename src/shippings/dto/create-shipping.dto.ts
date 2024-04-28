import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ReceivingPlaces } from '../enum/shippings.enum';

export class CreateShippingDto {
  @IsNotEmpty({ message: 'user name should not be empty' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'phone number should not be empty' })
  @IsString()
  phone: string;

  @IsNotEmpty({ message: 'province should not be empty' })
  @IsString()
  province: string;

  @IsNotEmpty({ message: 'district should not be empty' })
  @IsString()
  district: string;

  @IsNotEmpty({ message: 'district should not be empty' })
  @IsString()
  ward: string;

  @IsNotEmpty({ message: 'detailAddress should not be empty' })
  @IsString()
  detailAddress: string;

  @IsNotEmpty({ message: 'detailAddress should not be empty' })
  @IsBoolean()
  isDefaultAddress: boolean;

  @IsNotEmpty({ message: 'detailAddress should not be empty' })
  @IsEnum(ReceivingPlaces)
  receivePlace: ReceivingPlaces; //nơi nhận hàng // enum home or comany

  @IsOptional()
  companyName: string; // nơi làm việc
}
