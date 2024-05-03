import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/data-source';
import { UsersModule } from './users/users.module';
import { CurrentUserMiddleware } from './utility/middlewares/current-user.middleware';
import { CategoriesModule } from './categories/categories.module';
import { ProductsModule } from './products/products.module';
import { ReviewsModule } from './reviews/reviews.module';
import { OrdersModule } from './orders/orders.module';
import { VariantsModule } from './variants/variants.module';
import { VariantItemsModule } from './variant_items/variant_items.module';
import { ShippingsModule } from './shippings/shippings.module';
import { StoreCollectionsModule } from './store_collections/store_collections.module';
import { StoresModule } from './stores/stores.module';
import { VariantCategoriesModule } from './variant_categories/variant_categories.module';
import { OrderProductsModule } from './order_products/order_products.module';
import { JwtModule } from '@nestjs/jwt';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    UsersModule,
    CategoriesModule,
    ProductsModule,
    ReviewsModule,
    OrdersModule,
    VariantsModule,
    VariantItemsModule,
    ShippingsModule,
    StoreCollectionsModule,
    StoresModule,
    VariantCategoriesModule,
    OrderProductsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CurrentUserMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
