import { PartialType } from '@nestjs/mapped-types';
import { CreatePaidAuctionDto } from './create-paid-auction.dto';

export class UpdatePaidAuctionDto extends PartialType(CreatePaidAuctionDto) {}
