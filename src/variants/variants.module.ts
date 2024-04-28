import { Module } from '@nestjs/common';
import { VariantsController } from './variants.controller';
import { VariantsService } from './variants.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VariantEntity } from './entities/variant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VariantEntity])],
  controllers: [VariantsController],
  providers: [VariantsService],
  exports: [VariantsService],
})
export class VariantsModule {}
