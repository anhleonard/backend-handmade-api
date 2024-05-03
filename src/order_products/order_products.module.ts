import { Module } from '@nestjs/common';
import { OrderProductsController } from './order_products.controller';
import { OrderProductsService } from './order_products.service';
import { OrderProductEntity } from './entities/order-products.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from 'src/products/entities/product.entity';
import { VariantEntity } from 'src/variants/entities/variant.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderProductEntity,
      ProductEntity,
      VariantEntity,
    ]),
  ],
  controllers: [OrderProductsController],
  providers: [OrderProductsService],
})
export class OrderProductsModule {}
