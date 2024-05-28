import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RefundPayment {
  @IsNotEmpty({ message: 'zp_trans_id is not empty.' })
  @IsString()
  zp_trans_id: string;

  @IsNotEmpty({ message: 'amount is not empty.' })
  @IsNumber()
  amount: number;
}
