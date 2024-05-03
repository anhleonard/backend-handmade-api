import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { ProductsModule } from 'src/products/products.module';
import { ShippingEntity } from 'src/shippings/entities/shipping.entity';
import { OrderProductEntity } from '../order_products/entities/order-products.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderProductEntity, ShippingEntity]),
    forwardRef(() => ProductsModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
