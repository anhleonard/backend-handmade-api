import { Module } from '@nestjs/common';
import { VariantCategoriesController } from './variant_categories.controller';
import { VariantCategoriesService } from './variant_categories.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariantCategoryEntity } from './entities/variant-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VariantCategoryEntity])],
  controllers: [VariantCategoriesController],
  providers: [VariantCategoriesService],
})
export class VariantCategoriesModule {}
