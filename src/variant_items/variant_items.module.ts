import { Module } from '@nestjs/common';
import { VariantItemsService } from './variant_items.service';
import { VariantItemsController } from './variant_items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariantItemEntity } from './entities/variant-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VariantItemEntity])],
  providers: [VariantItemsService],
  controllers: [VariantItemsController],
  exports: [VariantItemsService],
})
export class VariantItemsModule {}
