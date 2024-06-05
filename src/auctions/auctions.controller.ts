import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
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
import { GetByAuctionStatus } from './dto/auction/get-auction-status.dto';
import { UpdateAuctionStatusDto } from './dto/auction/update-status-auction.dto';
import { CreateProgressDto } from './dto/progress/create-progress.dto';
import { UpdateProgressDto } from './dto/progress/update-progress.dto';
import { CreatePaidAuctionDto } from './dto/auction/create-paid-auction.dto';
import { UpdatePaidAuctionDto } from './dto/auction/update-paid-auction.dto';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  /// --------------- auction ------------------- ///

  @Get('/admin-filter-auctions/')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  async adminFilterAuctions(@Query() query: any) {
    return await this.auctionsService.adminFilterAuctions(query);
  }

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

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.ADMIN]))
  @Put('/update-status/:id')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatus: UpdateAuctionStatusDto,
  ) {
    return await this.auctionsService.updateStatus(+id, updateStatus);
  }

  @Get('/filter/')
  async filterAuctions(@Query() query: any) {
    return await this.auctionsService.filterAuctions(query);
  }

  //get all auctions of client
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  @Post('/client-auctions/')
  async findAllClientAuctions(
    @Body() auctionStatus: GetByAuctionStatus,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.auctionsService.findAllClientAuctions(
      auctionStatus,
      currentUser,
    );
  }

  //get all auctions of seller
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER]))
  @Post('/seller-auctions/')
  async findAllSellerAuctions(
    @Body() auctionStatus: GetByAuctionStatus,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.auctionsService.findAllSellerAuctions(
      auctionStatus,
      currentUser,
    );
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.auctionsService.findOne(+id);
  }

  @Delete('/delete/:id')
  async delete(@Param('id') id: string) {
    return await this.auctionsService.delete(+id);
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

  /// --------------- progress ------------------- ///
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER, Roles.USER]))
  @Post('/create-progress')
  async createProgress(
    @Body() createProgressDto: CreateProgressDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.auctionsService.createProgress(
      createProgressDto,
      currentUser,
    );
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.SELLER, Roles.USER]))
  @Put('/update-progress/:id')
  async updateProgress(
    @Param('id') id: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return await this.auctionsService.updateProgress(
      +id,
      updateProgressDto,
      currentUser,
    );
  }

  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  @Post('/create-paid-auction')
  async createPaidAuction(@Body() createPaidAuction: CreatePaidAuctionDto) {
    return await this.auctionsService.createPaidAuction(createPaidAuction);
  }

  @UseGuards(AuthenticationGuard)
  @Put('/update-paid-auction')
  async updatePaidAuction(@Body() updatePaidAuction: UpdatePaidAuctionDto) {
    return await this.auctionsService.updatePaidAuction(updatePaidAuction);
  }
}
