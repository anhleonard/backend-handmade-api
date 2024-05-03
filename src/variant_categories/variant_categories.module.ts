import { Module } from '@nestjs/common';
import { VariantCategoriesController } from './variant_categories.controller';
import { VariantCategoriesService } from './variant_categories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariantCategoryEntity } from './entities/variant-category.entity';
import { VariantItemEntity } from 'src/variant_items/entities/variant-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([VariantCategoryEntity, VariantItemEntity]),
  ],
  controllers: [VariantCategoriesController],
  providers: [VariantCategoriesService],
})
export class VariantCategoriesModule {}
