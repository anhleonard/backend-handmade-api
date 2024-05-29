import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePaidAuctionDto {
  @IsNotEmpty({ message: 'auctionId can not be empty.' })
  @IsNumber()
  auctionId: number;

  @IsNotEmpty({ message: 'type can not be empty.' })
  @IsString({ message: 'type should be string.' })
  type: string;

  @IsNotEmpty({ message: 'apptransid can not be empty.' })
  @IsString({ message: 'apptransid should be string.' })
  apptransid: string;

  @IsNotEmpty({ message: 'zp_trans_id can not be empty.' })
  @IsString({ message: 'zp_trans_id should be string.' })
  zp_trans_id: string;
}
