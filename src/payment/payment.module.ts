import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderProductEntity } from 'src/order_products/entities/order-products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderProductEntity])],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
