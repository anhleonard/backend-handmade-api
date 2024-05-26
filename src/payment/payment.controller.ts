import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthenticationGuard } from 'src/utility/guards/authentication.guard';
import { AuthorizeGuard } from 'src/utility/guards/authorization.guard';
import { Roles } from 'src/utility/common/user-roles.enum';
import { UserEntity } from 'src/users/entities/user.entity';
import { CurrentUser } from 'src/utility/decorators/current-user.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/')
  @UseGuards(AuthenticationGuard, AuthorizeGuard([Roles.USER]))
  async payment(
    @Body() createPaymentDto: CreatePaymentDto,
    @CurrentUser() currentUser: UserEntity,
  ) {
    return this.paymentService.payment(createPaymentDto, currentUser);
  }

  @Post('/callback')
  async callback(@Body() body: any) {
    return this.paymentService.callback(body);
  }

  @Get('/check-order-status/:id')
  async checkOrderStatus(@Param('id') id: string) {
    return this.paymentService.checkOrderStatus(id);
  }
}
