import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import { Roles } from 'src/utility/common/user-roles.enum';
import { CurrentUser } from 'src/utility/decorators/current-user.decorator';
import { UserEntity } from 'src/users/entities/user.entity';
import { CreateAuctionDto } from './dto/auction/create-auction.dto';
import { UpdateAuctionDto } from './dto/auction/update-auction.dto';
import { CreateBidderDto } from './dto/bidder/create-bidder.dto';
import { UpdateBidderDto } from './dto/bidder/update-bidder.dto';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  /// --------------- auction ------------------- ///

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  @Post('/create')
  async create(
    @Body() createAuctionDto: CreateAuctionDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.auctionsService.create(createAuctionDto, currentUser);
  }

  @UseGuards(AuthenticationGuard)
  @Put('/update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateAuctionDto: UpdateAuctionDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.auctionsService.update(
      +id,
      updateAuctionDto,
      currentUser,
    );
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.auctionsService.findOne(+id);
  }

  /// --------------- bidder ------------------- ///
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/create-bidder')
  async createBidder(
    @Body() createBidderDto: CreateBidderDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.auctionsService.createBidder(
      createBidderDto,
      currentUser,
    );
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER, Roles.USER]))
  @Put('/update-bidder/:id')
  async updateBidder(
    @Param('id') id: string,
    @Body() updateBidderDto: UpdateBidderDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.auctionsService.updateBidder(
      +id,
      updateBidderDto,
      currentUser,
    );
  }

  @Get('/bidders/:id')
  async findOneBidder(@Param('id') id: string) {
    return await this.auctionsService.findOneBidder(+id);
  }
}
