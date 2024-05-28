import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import { Roles } from 'src/utility/common/user-roles.enum';
import { UserEntity } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/utility/decorators/current-user.decorator';
import { CreateAuctionPaymentDto } from './dto/create-auction-payment.dto';
import { CreateOrderPaymentDto } from './dto/create-order-payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  async payment(
    @Body() createPaymentDto: CreateOrderPaymentDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.paymentService.payment(createPaymentDto, currentUser);
  }

  @Post('/auction')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  async paymentAuction(
    @CurrentUser() currentUser: UserEntity,
    @Body() auctionPayment: CreateAuctionPaymentDto,
  ) {
    return this.paymentService.paymentAuction(auctionPayment, currentUser);
  }

  @Post('/callback')
  async callback(@Body() body: any) {
    return this.paymentService.callback(body);
  }

  @Get('/check-order-status/:id')
  async checkOrderStatus(@Param('id') id: string) {
    return this.paymentService.checkOrderStatus(id);
  }

  @Post('/refund')
  async refund() {
    return this.paymentService.refund();
  }
}
