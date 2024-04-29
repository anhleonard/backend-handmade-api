import { Module } from '@nestjs/common';
import { StoreCollectionsController } from './store_collections.controller';
import { StoreCollectionsService } from './store_collections.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionEntity } from './entities/collection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CollectionEntity])],
  controllers: [StoreCollectionsController],
  providers: [StoreCollectionsService],
})
export class StoreCollectionsModule {}
