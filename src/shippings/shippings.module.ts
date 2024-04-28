import { Module } from '@nestjs/common';
import { ShippingsController } from './shippings.controller';
import { ShippingsService } from './shippings.service';
import { ShippingEntity } from './entities/shipping.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingEntity])],
  controllers: [ShippingsController],
  providers: [ShippingsService],
  exports: [ShippingsService],
})
export class ShippingsModule {}
