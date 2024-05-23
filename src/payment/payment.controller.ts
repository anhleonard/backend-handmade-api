import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/')
  async payment() {
    return this.paymentService.payment();
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
