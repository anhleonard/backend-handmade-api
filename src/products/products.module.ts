import { Module, forwardRef } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductEntity } from './entities/product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesModule } from 'src/categories/categories.module';
import { OrdersModule } from 'src/orders/orders.module';
import { VariantsModule } from 'src/variants/variants.module';
import { VariantItemsModule } from 'src/variant_items/variant_items.module';
import { VariantEntity } from 'src/variants/entities/variant.entity';
import { VariantItemEntity } from 'src/variant_items/entities/variant-item.entity';
import { UserEntity } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductEntity,
      VariantEntity,
      VariantItemEntity,
      UserEntity,
    ]),
    CategoriesModule,
    VariantsModule,
    VariantItemsModule,
    UsersModule,
    forwardRef(() => OrdersModule),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
