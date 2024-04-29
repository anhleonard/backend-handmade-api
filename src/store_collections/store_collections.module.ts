import { Module } from '@nestjs/common';
import { StoreCollectionsController } from './store_collections.controller';
import { StoreCollectionsService } from './store_collections.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CollectionEntity } from './entities/collection.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { ProductEntity } from 'src/products/entities/product.entity';
import { StoreEntity } from 'src/stores/entities/stores.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CollectionEntity,
      UserEntity,
      ProductEntity,
      StoreEntity,
    ]),
  ],
  controllers: [StoreCollectionsController],
  providers: [StoreCollectionsService],
})
export class StoreCollectionsModule {}
