import { IsNotEmpty, IsString } from 'class-validator';

export class CancelOrderDto {
  @IsNotEmpty({ message: 'canceledReason is not empty.' })
  @IsString()
  canceledReason: string;
}
